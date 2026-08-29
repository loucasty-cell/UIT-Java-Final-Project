package com.skillbridge.swap.application;

import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.api.mapper.SwapMapper;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
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
public class SwapService {

    static final String ESCROW_REFERENCE_TYPE = "SWAP_REQUEST";

    private final SwapRequestRepository requestRepository;
    private final SwapSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final WalletRepository walletRepository;
    private final WalletService walletService;
    private final SwapMapper swapMapper;
    private final NotificationService notificationService;
    private final com.skillbridge.milestone.application.MilestoneService milestoneService;

    public SwapRequestResponse createProposal(CreateSwapProposalRequest request) {
        UUID requesterId = SecurityUtils.getCurrentUserId();
        validateParticipants(requesterId, request.getResponderId());
        validateSkill(request.getOfferedSkillId(), "Offered skill not found");
        validateSkill(request.getRequestedSkillId(), "Requested skill not found");

        int pointCost = request.getPointCost() != null ? request.getPointCost() : 0;
        validatePointCost(requesterId, pointCost);

        OffsetDateTime now = OffsetDateTime.now();
        SwapRequest swapRequest = new SwapRequest();
        swapRequest.setId(UUID.randomUUID());
        swapRequest.setRequesterId(requesterId);
        swapRequest.setResponderId(request.getResponderId());
        swapRequest.setOfferedSkillId(request.getOfferedSkillId());
        swapRequest.setRequestedSkillId(request.getRequestedSkillId());
        swapRequest.setPointCost(pointCost);
        swapRequest.setPointsHeld(false);
        swapRequest.setMessage(request.getMessage());
        swapRequest.setStatus(SwapRequestStatus.PENDING);
        swapRequest.setCreatedAt(now);
        swapRequest.setUpdatedAt(now);

        SwapRequest saved = requestRepository.save(swapRequest);
        notificationService.notifySwapProposalUpdate(
                saved.getResponderId(),
                NotificationType.SWAP_PROPOSAL_CREATED,
                saved.getId()
        );
        return swapMapper.toRequestResponse(saved);
    }

    public SwapRequestResponse acceptProposal(UUID requestId) {
        SwapRequest swapRequest = loadRequest(requestId);
        requireParticipant(swapRequest, SecurityUtils.getCurrentUserId(), true, "Only the responder can accept this proposal");
        requireStatus(swapRequest, SwapRequestStatus.PENDING, "Only pending swap proposals can be accepted");

        OffsetDateTime now = OffsetDateTime.now();
        if (hasPointCost(swapRequest)) {
            walletService.holdPoints(
                    swapRequest.getRequesterId(),
                    swapRequest.getResponderId(),
                    swapRequest.getPointCost(),
                    ESCROW_REFERENCE_TYPE,
                    swapRequest.getId(),
                    "SWAP_HOLD:" + swapRequest.getId()
            );
            swapRequest.setPointsHeld(true);
        }

        swapRequest.setStatus(SwapRequestStatus.ACCEPTED);
        swapRequest.setAcceptedAt(now);
        swapRequest.setUpdatedAt(now);

        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(swapRequest.getId());
        session.setRequesterId(swapRequest.getRequesterId());
        session.setResponderId(swapRequest.getResponderId());
        session.setOfferedSkillId(swapRequest.getOfferedSkillId());
        session.setRequestedSkillId(swapRequest.getRequestedSkillId());
        session.setPointCost(swapRequest.getPointCost());
        session.setStatus(SwapSessionStatus.ACCEPTED);
        session.setAcceptedAt(now);
        session.setCreatedAt(now);
        session.setUpdatedAt(now);

        requestRepository.save(swapRequest);
        sessionRepository.save(session);
        notificationService.notifySwapProposalUpdate(
                swapRequest.getRequesterId(),
                NotificationType.SWAP_PROPOSAL_ACCEPTED,
                swapRequest.getId()
        );

        return swapMapper.toRequestResponse(swapRequest);
    }

    public SwapRequestResponse rejectProposal(UUID requestId) {
        SwapRequest swapRequest = loadRequest(requestId);
        requireParticipant(swapRequest, SecurityUtils.getCurrentUserId(), true, "Only the responder can reject this proposal");
        requireStatus(swapRequest, SwapRequestStatus.PENDING, "Only pending swap proposals can be rejected");

        OffsetDateTime now = OffsetDateTime.now();
        swapRequest.setStatus(SwapRequestStatus.REJECTED);
        swapRequest.setRejectedAt(now);
        swapRequest.setUpdatedAt(now);

        SwapRequest saved = requestRepository.save(swapRequest);
        notificationService.notifySwapProposalUpdate(
                saved.getRequesterId(),
                NotificationType.SWAP_PROPOSAL_REJECTED,
                saved.getId()
        );
        return swapMapper.toRequestResponse(saved);
    }

    @Transactional(readOnly = true)
    public SwapRequestResponse getSwapProposal(UUID requestId) {
        return swapMapper.toRequestResponse(loadRequest(requestId));
    }

    public SwapSessionResponse completeSwapSession(UUID sessionId) {
        SwapSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Swap session not found: " + sessionId));
        requireSessionParticipant(session, SecurityUtils.getCurrentUserId(), "Only session participants can complete this session");
        if (session.getStatus() != SwapSessionStatus.ACCEPTED && session.getStatus() != SwapSessionStatus.STARTED) {
            throw new IllegalStateException("Only accepted or started swap sessions can be completed");
        }

        SwapRequest swapRequest = loadRequest(session.getSwapRequestId());
        if (swapRequest.getStatus() != SwapRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Swap request is not accepted");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
            walletService.releaseHeldPoints(
                    swapRequest.getRequesterId(),
                    swapRequest.getResponderId(),
                    ESCROW_REFERENCE_TYPE,
                    swapRequest.getId(),
                    "SWAP_RELEASE:" + swapRequest.getId()
            );
            swapRequest.setPointsHeld(false);
        }

        swapRequest.setStatus(SwapRequestStatus.COMPLETED);
        swapRequest.setCompletedAt(now);
        swapRequest.setUpdatedAt(now);
        session.setStatus(SwapSessionStatus.COMPLETED);
        session.setCompletedAt(now);
        session.setUpdatedAt(now);

        requestRepository.save(swapRequest);
        SwapSession savedSession = sessionRepository.save(session);

        // Volunteer reward: +5 points to mentor if volunteer mode
        if (savedSession.getMode() == com.skillbridge.shared.domain.model.SessionMode.VOLUNTEER) {
            walletService.creditPoints(
                    savedSession.getResponderId(),
                    5,
                    com.skillbridge.wallet.domain.model.PointEventType.VOLUNTEER_REWARD,
                    "SESSION_VOLUNTEER",
                    savedSession.getId()
            );
        }

        // Milestone progression evaluations for both participants
        milestoneService.checkAndAwardMilestones(savedSession.getRequesterId());
        milestoneService.checkAndAwardMilestones(savedSession.getResponderId());

        notificationService.notifySessionStatusChange(
                swapRequest.getRequesterId(),
                NotificationType.SESSION_COMPLETED,
                savedSession.getId()
        );
        notificationService.notifySessionStatusChange(
                swapRequest.getResponderId(),
                NotificationType.SESSION_COMPLETED,
                savedSession.getId()
        );
        return swapMapper.toSessionResponse(savedSession);
    }

    @Transactional(readOnly = true)
    public List<SwapRequestResponse> getSwapHistory() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return requestRepository.findByRequesterIdOrResponderIdOrderByCreatedAtDesc(userId, userId).stream()
                .map(swapMapper::toRequestResponse)
                .toList();
    }

    public SwapRequestResponse cancelProposal(UUID requestId) {
        SwapRequest swapRequest = loadRequest(requestId);
        requireParticipant(swapRequest, SecurityUtils.getCurrentUserId(), false, "Only the requester can cancel this proposal");
        if (swapRequest.getStatus() != SwapRequestStatus.PENDING && swapRequest.getStatus() != SwapRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Only pending or accepted swap proposals can be cancelled");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
            walletService.refundHeldPoints(
                    swapRequest.getRequesterId(),
                    ESCROW_REFERENCE_TYPE,
                    swapRequest.getId(),
                    "SWAP_REFUND:" + swapRequest.getId()
            );
            swapRequest.setPointsHeld(false);
        }

        sessionRepository.findBySwapRequestId(requestId).ifPresent(session -> {
            session.setStatus(SwapSessionStatus.CANCELLED);
            session.setUpdatedAt(now);
            sessionRepository.save(session);
        });

        swapRequest.setStatus(SwapRequestStatus.CANCELLED);
        swapRequest.setCancelledAt(now);
        swapRequest.setUpdatedAt(now);
        SwapRequest saved = requestRepository.save(swapRequest);
        notificationService.notifySwapProposalUpdate(
                saved.getResponderId(),
                NotificationType.SWAP_PROPOSAL_CANCELLED,
                saved.getId()
        );
        return swapMapper.toRequestResponse(saved);
    }

    private SwapRequest loadRequest(UUID requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Swap proposal not found: " + requestId));
    }

    private void validateParticipants(UUID requesterId, UUID responderId) {
        if (requesterId.equals(responderId)) {
            throw new IllegalArgumentException("Requester and responder must be different users");
        }
        if (!userRepository.existsById(requesterId)) {
            throw new IllegalArgumentException("Requester not found: " + requesterId);
        }
        if (!userRepository.existsById(responderId)) {
            throw new IllegalArgumentException("Responder not found: " + responderId);
        }
    }

    private void validateSkill(UUID skillId, String message) {
        if (!skillRepository.existsById(skillId)) {
            throw new IllegalArgumentException(message + ": " + skillId);
        }
    }

    private void validatePointCost(UUID requesterId, int pointCost) {
        if (pointCost < 0) {
            throw new IllegalArgumentException("Point cost must not be negative");
        }
        if (pointCost == 0) {
            return;
        }

        walletRepository.findByUserId(requesterId)
                .filter(wallet -> wallet.getAvailablePoints() >= pointCost)
                .orElseThrow(() -> new IllegalArgumentException("Insufficient available points"));
    }

    private void requireStatus(SwapRequest swapRequest, SwapRequestStatus expected, String message) {
        if (swapRequest.getStatus() != expected) {
            throw new IllegalStateException(message);
        }
    }

    private void requireParticipant(SwapRequest swapRequest, UUID userId, boolean responderOnly, String message) {
        UUID expected = responderOnly ? swapRequest.getResponderId() : swapRequest.getRequesterId();
        if (!expected.equals(userId)) {
            throw new AccessDeniedException(message);
        }
    }

    private void requireSessionParticipant(SwapSession session, UUID userId, String message) {
        if (!session.getRequesterId().equals(userId) && !session.getResponderId().equals(userId)) {
            throw new AccessDeniedException(message);
        }
    }

    private boolean hasPointCost(SwapRequest swapRequest) {
        return swapRequest.getPointCost() != null && swapRequest.getPointCost() > 0;
    }
}
