package com.skillbridge.learningrequest.application.command;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.learningrequest.api.dto.request.CreateLearningRequest;
import com.skillbridge.learningrequest.api.dto.request.RejectLearningRequest;
import com.skillbridge.learningrequest.api.dto.response.LearningRequestResponse;
import com.skillbridge.learningrequest.api.mapper.LearningRequestMapper;
import com.skillbridge.learningrequest.application.query.ScheduleConflictService;
import com.skillbridge.learningrequest.domain.entity.LearningRequest;
import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import com.skillbridge.learningrequest.infrastructure.persistence.LearningRequestRepository;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.SessionMode;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.entity.Wallet;
import com.skillbridge.wallet.domain.model.PointEventType;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class LearningRequestService {

    private final LearningRequestRepository learningRequestRepository;
    private final ScheduleConflictService scheduleConflictService;
    private final SwapSessionRepository swapSessionRepository;
    private final SwapRequestRepository swapRequestRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final MentorOfferingRepository mentorOfferingRepository;
    private final UserSkillRepository userSkillRepository;
    private final WalletService walletService;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;
    private final LearningRequestMapper learningRequestMapper;

    public LearningRequestResponse createLearningRequest(CreateLearningRequest request) {
        return createLearningRequest(request, null);
    }

    public LearningRequestResponse createLearningRequest(CreateLearningRequest request, String idempotencyKey) {
        UUID learnerId = SecurityUtils.getCurrentUserId();

        if (learnerId.equals(request.getMentorId())) {
            throw new IllegalArgumentException("You cannot request a learning session with yourself");
        }

        if (request.getSourceForumPostId() != null) {
            request.setMode(SessionMode.VOLUNTEER);
        }

        User learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Learner user not found"));
        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new IllegalArgumentException("Mentor user not found"));
        Skill requestedSkill = skillRepository.findById(request.getRequestedSkillId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Requested skill not found: " + request.getRequestedSkillId()));

        int pointCost = 0;
        boolean pointsHeld = false;
        int durationMinutes = (request.getDurationMinutes() != null && request.getDurationMinutes() > 0)
                ? request.getDurationMinutes()
                : 60;

        // Mode specific validation
        if (request.getMode() == SessionMode.POINTS) {
            if (request.getMentorOfferingId() != null) {
                MentorOffering offering = mentorOfferingRepository.findById(request.getMentorOfferingId())
                        .orElseThrow(() -> new IllegalArgumentException("Mentor offering not found"));
                pointCost = offering.getPointCost();
            } else {
                pointCost = 10;
            }

            if (pointCost > 0) {
                Wallet learnerWallet = walletService.ensureWallet(learnerId);
                if (learnerWallet.getAvailablePoints() < pointCost) {
                    throw new IllegalArgumentException(
                            "Insufficient points: you have " + learnerWallet.getAvailablePoints()
                                    + " available, but this session requires " + pointCost);
                }
            }
        } else if (request.getMode() == SessionMode.SKILL_SWAP) {
            if (request.getOfferedUserSkillId() == null) {
                throw new IllegalArgumentException("Offered skill is required for SKILL_SWAP mode");
            }
            UserSkill offeredUserSkill = userSkillRepository
                    .findByIdAndUserId(request.getOfferedUserSkillId(), learnerId)
                    .orElseThrow(() -> new IllegalArgumentException("Offered skill does not belong to you"));

            if (offeredUserSkill.getDirection() != Direction.TEACH) {
                throw new IllegalArgumentException("Offered skill must be configured for teaching");
            }
        } else if (request.getMode() == SessionMode.VOLUNTEER) {
            pointCost = 0;
        }

        // 15-minute buffer conflict check for BOTH learner and mentor
        scheduleConflictService.validateNoConflict(learnerId, request.getScheduledStart(), durationMinutes);
        scheduleConflictService.validateNoConflict(request.getMentorId(), request.getScheduledStart(), durationMinutes);

        // Create learning request
        LearningRequest entity = new LearningRequest();
        entity.setId(UUID.randomUUID());
        entity.setLearnerId(learnerId);
        entity.setMentorId(request.getMentorId());
        entity.setMentorOfferingId(request.getMentorOfferingId());
        entity.setRequestedSkillId(request.getRequestedSkillId());
        entity.setOfferedUserSkillId(request.getOfferedUserSkillId());
        entity.setMode(request.getMode());
        entity.setScheduledStart(request.getScheduledStart());
        entity.setDurationMinutes(durationMinutes);
        entity.setPointCost(pointCost);
        entity.setMessage(request.getMessage());
        entity.setStatus(LearningRequestStatus.PENDING);
        entity.setSourceForumPostId(request.getSourceForumPostId());

        if (pointCost > 0 && request.getMode() == SessionMode.POINTS) {
            String holdKey = (idempotencyKey != null && !idempotencyKey.isBlank())
                    ? idempotencyKey
                    : "HOLD:LR:" + entity.getId();
            walletService.holdPoints(
                    learnerId,
                    request.getMentorId(),
                    pointCost,
                    "LEARNING_REQUEST",
                    entity.getId(),
                    holdKey);
            pointsHeld = true;
        }
        entity.setPointsHeld(pointsHeld);

        LearningRequest saved = learningRequestRepository.save(entity);

        // Notify mentor
        notificationService.notifyUser(
                request.getMentorId(),
                "Learning Request Received",
                "New " + request.getMode() + " learning request received from " + learner.getFirstName(),
                "LEARNING_REQUEST",
                saved.getId());

        return learningRequestMapper.toResponse(saved, learner, mentor, requestedSkill);
    }

    @Transactional(readOnly = true)
    public List<LearningRequestResponse> getLearningRequests(String direction, LearningRequestStatus status) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<LearningRequest> requests;

        if ("INCOMING".equalsIgnoreCase(direction)) {
            requests = (status != null)
                    ? learningRequestRepository.findByMentorIdAndStatusOrderByCreatedAtDesc(currentUserId, status)
                    : learningRequestRepository.findByMentorIdOrderByCreatedAtDesc(currentUserId);
        } else {
            requests = (status != null)
                    ? learningRequestRepository.findByLearnerIdAndStatusOrderByCreatedAtDesc(currentUserId, status)
                    : learningRequestRepository.findByLearnerIdOrderByCreatedAtDesc(currentUserId);
        }

        return requests.stream().map(req -> {
            User learner = userRepository.findById(req.getLearnerId()).orElse(null);
            User mentor = userRepository.findById(req.getMentorId()).orElse(null);
            Skill skill = skillRepository.findById(req.getRequestedSkillId()).orElse(null);
            return learningRequestMapper.toResponse(req, learner, mentor, skill);
        }).toList();
    }

    @Transactional(readOnly = true)
    public LearningRequestResponse getLearningRequest(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LearningRequest entity = learningRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning request not found: " + id));

        if (!entity.getLearnerId().equals(currentUserId) && !entity.getMentorId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not a participant in this learning request");
        }

        User learner = userRepository.findById(entity.getLearnerId()).orElse(null);
        User mentor = userRepository.findById(entity.getMentorId()).orElse(null);
        Skill skill = skillRepository.findById(entity.getRequestedSkillId()).orElse(null);
        return learningRequestMapper.toResponse(entity, learner, mentor, skill);
    }

    public LearningRequestResponse acceptLearningRequest(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LearningRequest entity = learningRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning request not found: " + id));

        if (!entity.getMentorId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the mentor can accept this learning request");
        }

        if (entity.getStatus() != LearningRequestStatus.PENDING) {
            throw new IllegalStateException("Learning request cannot be accepted from status: " + entity.getStatus());
        }

        // Re-validate conflict check before final acceptance
        scheduleConflictService.validateNoConflict(entity.getMentorId(), entity.getScheduledStart(),
                entity.getDurationMinutes());
        scheduleConflictService.validateNoConflict(entity.getLearnerId(), entity.getScheduledStart(),
                entity.getDurationMinutes());

        // Create backing SwapRequest and SwapSession records
        OffsetDateTime now = OffsetDateTime.now();
        UUID offeredSkillId = entity.getOfferedUserSkillId() != null
                ? userSkillRepository.findById(entity.getOfferedUserSkillId()).map(UserSkill::getSkillId)
                        .orElse(entity.getRequestedSkillId())
                : entity.getRequestedSkillId();

        SwapRequest swapRequest = new SwapRequest();
        swapRequest.setId(UUID.randomUUID());
        swapRequest.setRequesterId(entity.getLearnerId());
        swapRequest.setResponderId(entity.getMentorId());
        swapRequest.setOfferedSkillId(offeredSkillId);
        swapRequest.setRequestedSkillId(entity.getRequestedSkillId());
        swapRequest.setPointCost(entity.getPointCost());
        swapRequest.setPointsHeld(entity.getPointsHeld());
        swapRequest.setMessage(entity.getMessage());
        swapRequest.setStatus(SwapRequestStatus.ACCEPTED);
        swapRequest.setAcceptedAt(now);
        swapRequest.setCreatedAt(now);
        swapRequest.setUpdatedAt(now);
        SwapRequest savedSwapRequest = swapRequestRepository.save(swapRequest);

        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(savedSwapRequest.getId());
        session.setRequesterId(entity.getLearnerId());
        session.setResponderId(entity.getMentorId());
        session.setOfferedSkillId(offeredSkillId);
        session.setRequestedSkillId(entity.getRequestedSkillId());
        session.setPointCost(entity.getPointCost());
        session.setStatus(SwapSessionStatus.SCHEDULED);
        session.setAcceptedAt(now);
        session.setScheduledAt(entity.getScheduledStart());
        session.setDurationMinutes(entity.getDurationMinutes());
        session.setScheduledEnd(entity.getScheduledStart().plusMinutes(entity.getDurationMinutes()));
        session.setMode(entity.getMode());
        session.setNotes(entity.getMessage());
        session.setCreatedAt(now);
        session.setUpdatedAt(now);
        SwapSession savedSession = swapSessionRepository.save(session);

        entity.setStatus(LearningRequestStatus.ACCEPTED);
        entity.setSessionId(savedSession.getId());
        LearningRequest saved = learningRequestRepository.save(entity);

        // Notify learner
        notificationService.notifyUser(
                entity.getLearnerId(),
                "Learning Request Accepted",
                "Your learning request was accepted! Session scheduled for " + entity.getScheduledStart(),
                "SWAP_SESSION",
                savedSession.getId());

        User learner = userRepository.findById(entity.getLearnerId()).orElse(null);
        User mentor = userRepository.findById(entity.getMentorId()).orElse(null);
        Skill skill = skillRepository.findById(entity.getRequestedSkillId()).orElse(null);
        return learningRequestMapper.toResponse(saved, learner, mentor, skill);
    }

    public LearningRequestResponse rejectLearningRequest(UUID id, RejectLearningRequest rejectRequest) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LearningRequest entity = learningRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning request not found: " + id));

        if (!entity.getMentorId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the mentor can reject this learning request");
        }

        if (entity.getStatus() != LearningRequestStatus.PENDING) {
            throw new IllegalStateException("Learning request cannot be rejected from status: " + entity.getStatus());
        }

        // Refund held points if any
        if (entity.getPointsHeld() && entity.getPointCost() > 0) {
            walletService.refundHeldPoints(
                    entity.getLearnerId(),
                    "LEARNING_REQUEST",
                    entity.getId(),
                    "REFUND:LR:" + entity.getId());
            entity.setPointsHeld(false);
        }

        entity.setStatus(LearningRequestStatus.REJECTED);
        LearningRequest saved = learningRequestRepository.save(entity);

        String reasonNote = (rejectRequest != null && rejectRequest.getReason() != null)
                ? ": " + rejectRequest.getReason()
                : ".";
        notificationService.notifyUser(
                entity.getLearnerId(),
                "Learning Request Declined",
                "Your learning request was declined by the mentor" + reasonNote,
                "LEARNING_REQUEST",
                entity.getId());

        User learner = userRepository.findById(entity.getLearnerId()).orElse(null);
        User mentor = userRepository.findById(entity.getMentorId()).orElse(null);
        Skill skill = skillRepository.findById(entity.getRequestedSkillId()).orElse(null);
        return learningRequestMapper.toResponse(saved, learner, mentor, skill);
    }

    public LearningRequestResponse cancelLearningRequest(UUID id, RejectLearningRequest cancelRequest) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LearningRequest entity = learningRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning request not found: " + id));

        if (!entity.getLearnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the requester can cancel this learning request");
        }

        if (entity.getStatus() != LearningRequestStatus.PENDING) {
            throw new IllegalStateException("Learning request cannot be cancelled from status: " + entity.getStatus());
        }

        // Refund held points if any
        if (entity.getPointsHeld() && entity.getPointCost() > 0) {
            walletService.refundHeldPoints(
                    entity.getLearnerId(),
                    "LEARNING_REQUEST",
                    entity.getId(),
                    "REFUND:CANCEL_LR:" + entity.getId());
            entity.setPointsHeld(false);
        }

        entity.setStatus(LearningRequestStatus.CANCELLED);
        LearningRequest saved = learningRequestRepository.save(entity);

        notificationService.notifyUser(
                entity.getMentorId(),
                "Learning Request Cancelled",
                "A pending learning request was cancelled by the learner.",
                "LEARNING_REQUEST",
                entity.getId());

        User learner = userRepository.findById(entity.getLearnerId()).orElse(null);
        User mentor = userRepository.findById(entity.getMentorId()).orElse(null);
        Skill skill = skillRepository.findById(entity.getRequestedSkillId()).orElse(null);
        return learningRequestMapper.toResponse(saved, learner, mentor, skill);
    }
}
