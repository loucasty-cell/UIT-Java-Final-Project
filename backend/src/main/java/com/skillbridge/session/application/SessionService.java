package com.skillbridge.session.application;

import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.entity.PlatformSetting;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.session.api.dto.request.CreateDisputeRequest;
import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionConfirmationResponse;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.session.domain.entity.SessionConfirmation;
import com.skillbridge.session.infrastructure.persistence.SessionConfirmationRepository;
import com.skillbridge.shared.domain.model.Mode;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
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
public class SessionService {

    private static final int DEFAULT_ESCROW_RELEASE_HOURS = 18;

    private final SwapSessionRepository sessionRepository;
    private final SwapService swapService;
    private final SessionMapper sessionMapper;
    private final NotificationService notificationService;
    private final DisputeRepository disputeRepository;
    private final AdminMapper adminMapper;
    private final SessionConfirmationRepository confirmationRepository;
    private final PlatformSettingRepository platformSettingRepository;

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSwapSessions() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return sessionRepository
                .findActiveByUserId(userId, List.of(
                        SwapSessionStatus.ACCEPTED,
                        SwapSessionStatus.SCHEDULED,
                        SwapSessionStatus.STARTED))
                .stream()
                .map(sessionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getAllUserSessions(SwapSessionStatus status) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<SwapSession> list;
        if (status != null) {
            list = sessionRepository.findByUserIdAndStatus(userId, status);
        } else {
            list = sessionRepository.findAllByUserId(userId);
        }
        return list.stream().map(sessionMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> getCalendarSessions(OffsetDateTime start, OffsetDateTime end) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<SwapSession> list;
        if (start != null && end != null) {
            list = sessionRepository.findSessionsInDateRange(userId, start, end);
        } else {
            list = sessionRepository.findAllByUserId(userId);
        }
        return list.stream().map(sessionMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SessionResponse getSessionDetail(UUID sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        SwapSession session = loadSession(sessionId);
        requireParticipant(session, "Only session participants can view this session");
        return sessionMapper.toResponse(session);
    }

    public SessionResponse startSession(UUID sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        SwapSession session = loadSession(sessionId);
        requireParticipant(session, "Only session participants can start this session");
        if (session.getStatus() != SwapSessionStatus.ACCEPTED) {
            throw new IllegalStateException("Only accepted sessions can be started");
        }

        session.setStatus(SwapSessionStatus.STARTED);
        session.setStartedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        SwapSession saved = sessionRepository.save(session);
        notifyParticipants(saved, NotificationType.SESSION_STARTED);
        return sessionMapper.toResponse(saved);
    }

    public SessionResponse completeSession(UUID sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        confirmCompletion(sessionId);
        return sessionMapper.toResponse(loadSession(sessionId));
    }

    public SessionConfirmationResponse confirmCompletion(UUID sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        SwapSession session = loadSession(sessionId);
        requireParticipant(session, "Only session participants can complete this session");

        if (session.getStatus() == SwapSessionStatus.COMPLETED) {
            return confirmationResponse(session, true, true,
                    session.getPointCostSnapshot() != null ? session.getPointCostSnapshot() : 0);
        }
        if (session.getStatus() != SwapSessionStatus.ACCEPTED
                && session.getStatus() != SwapSessionStatus.SCHEDULED
                && session.getStatus() != SwapSessionStatus.STARTED
                && session.getStatus() != SwapSessionStatus.AWAITING_CONFIRMATION) {
            throw new IllegalStateException("Only active sessions can be completed");
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (!confirmationRepository.existsBySessionIdAndConfirmedBy(sessionId, currentUserId)) {
            SessionConfirmation confirmation = new SessionConfirmation();
            confirmation.setId(UUID.randomUUID());
            confirmation.setSessionId(sessionId);
            confirmation.setConfirmedBy(currentUserId);
            confirmation.setConfirmedAt(OffsetDateTime.now());
            confirmationRepository.save(confirmation);
        }

        UUID otherParticipantId = session.getRequesterId().equals(currentUserId)
                ? session.getResponderId()
                : session.getRequesterId();

        boolean otherConfirmed = confirmationRepository.existsBySessionIdAndConfirmedBy(sessionId, otherParticipantId);

        int pointsReleased = 0;
        if (otherConfirmed) {
            // Both confirmed -> complete immediately
            swapService.completeSwapSession(sessionId);
            session = loadSession(sessionId);
            pointsReleased = (session.getPointCostSnapshot() != null) ? session.getPointCostSnapshot() : 0;
        } else {
            // First confirmation -> set auto release deadline and notify other party
            int releaseHours = platformSettingRepository.findTopByOrderByUpdatedAtDesc()
                    .map(PlatformSetting::getEscrowReleaseHours)
                    .orElse(DEFAULT_ESCROW_RELEASE_HOURS);

            session.setStatus(SwapSessionStatus.AWAITING_CONFIRMATION);
            if (session.getAutoReleaseAt() == null) {
                session.setAutoReleaseAt(OffsetDateTime.now().plusHours(releaseHours));
            }
            session.setUpdatedAt(OffsetDateTime.now());
            session = sessionRepository.save(session);

            notificationService.notifySessionStatusChange(otherParticipantId, NotificationType.SESSION_UPDATED,
                    sessionId);
        }

        return confirmationResponse(session, true, otherConfirmed, pointsReleased);
    }

    private SessionConfirmationResponse confirmationResponse(
            SwapSession session, boolean confirmedByMe, boolean confirmedByOther, int pointsReleased) {
        return SessionConfirmationResponse.builder()
                .id(session.getId())
                .status(session.getStatus())
                .pointsReleased(pointsReleased)
                .autoReleaseAt(session.getAutoReleaseAt())
                .confirmedByMe(confirmedByMe)
                .confirmedByOther(confirmedByOther)
                .build();
    }

    public SessionResponse updateSession(UUID sessionId, UpdateSessionRequest request) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Update session request must not be null");
        }
        if (request.getDurationMinutes() != null && request.getDurationMinutes() < 1) {
            throw new IllegalArgumentException("Duration minutes must be at least 1");
        }
        SwapSession session = loadSession(sessionId);
        requireParticipant(session, "Only session participants can update this session");
        if (session.getStatus() == SwapSessionStatus.COMPLETED || session.getStatus() == SwapSessionStatus.CANCELLED
                || session.getStatus() == SwapSessionStatus.DISPUTED) {
            throw new IllegalStateException("Completed, cancelled, or disputed sessions cannot be updated");
        }

        if (request.getScheduledAt() != null) {
            session.setScheduledAt(request.getScheduledAt());
            int duration = request.getDurationMinutes() != null ? request.getDurationMinutes() : (session.getDurationMinutes() != null ? session.getDurationMinutes() : 60);
            session.setScheduledEnd(request.getScheduledAt().plusMinutes(duration));
        }
        if (request.getDurationMinutes() != null) {
            session.setDurationMinutes(request.getDurationMinutes());
            if (session.getScheduledAt() != null) {
                session.setScheduledEnd(session.getScheduledAt().plusMinutes(request.getDurationMinutes()));
            }
        }
        if (request.getMeetingUrl() != null) {
            session.setMeetingUrl(request.getMeetingUrl());
        }
        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }
        session.setUpdatedAt(OffsetDateTime.now());
        SwapSession saved = sessionRepository.save(session);
        notifyParticipants(saved, NotificationType.SESSION_UPDATED);
        return sessionMapper.toResponse(saved);
    }

    public DisputeResponse openDispute(UUID sessionId, CreateDisputeRequest request) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        if (request == null) {
            throw new IllegalArgumentException("Dispute request must not be null");
        }
        SwapSession session = loadSession(sessionId);
        requireParticipant(session, "Only session participants can open a dispute");

        if (session.getStatus() == SwapSessionStatus.CANCELLED) {
            throw new IllegalStateException("Cannot dispute a cancelled session");
        }
        if (session.getStatus() == SwapSessionStatus.DISPUTED) {
            throw new IllegalStateException("A dispute is already active for this session");
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        OffsetDateTime now = OffsetDateTime.now();

        Dispute dispute = new Dispute();
        dispute.setId(UUID.randomUUID());
        dispute.setSessionId(sessionId);
        dispute.setSessionMode(session.getMode() != null ? Mode.valueOf(session.getMode().name())
                : session.getPointCost() != null && session.getPointCost() > 0 ? Mode.POINTS : Mode.SKILL_SWAP);
        dispute.setOpenedBy(currentUserId);
        dispute.setReason(request.getReason());
        dispute.setDetails(request.getDetails());
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setCreatedAt(now);
        dispute.setUpdatedAt(now);
        Dispute savedDispute = disputeRepository.save(dispute);

        session.setStatus(SwapSessionStatus.DISPUTED);
        session.setUpdatedAt(now);
        sessionRepository.save(session);

        notificationService.notifySessionStatusChange(session.getRequesterId(), NotificationType.SESSION_UPDATED,
                sessionId);
        notificationService.notifySessionStatusChange(session.getResponderId(), NotificationType.SESSION_UPDATED,
                sessionId);

        return adminMapper.toResponse(savedDispute);
    }

    private SwapSession loadSession(UUID sessionId) {
        if (sessionId == null) {
            throw new IllegalArgumentException("Session ID must not be null");
        }
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
    }

    private void requireParticipant(SwapSession session, String message) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!session.getRequesterId().equals(userId) && !session.getResponderId().equals(userId)) {
            throw new AccessDeniedException(message);
        }
    }

    private void notifyParticipants(SwapSession session, NotificationType type) {
        notificationService.notifySessionStatusChange(session.getRequesterId(), type, session.getId());
        notificationService.notifySessionStatusChange(session.getResponderId(), type, session.getId());
    }
}
