package com.skillbridge.session.application;

import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class SessionService {

    private final SwapSessionRepository sessionRepository;
    private final SwapService swapService;
    private final SessionMapper sessionMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<SessionResponse> getActiveSwapSessions(UUID userId) {
        return sessionRepository
                .findActiveByUserId(userId, List.of(SwapSessionStatus.ACCEPTED, SwapSessionStatus.STARTED))
                .stream()
                .map(sessionMapper::toResponse)
                .toList();
    }

    public SessionResponse startSession(UUID sessionId) {
        SwapSession session = loadSession(sessionId);
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
        swapService.completeSwapSession(sessionId);
        return sessionMapper.toResponse(loadSession(sessionId));
    }

    public SessionResponse updateSession(UUID sessionId, UpdateSessionRequest request) {
        SwapSession session = loadSession(sessionId);
        if (session.getStatus() == SwapSessionStatus.COMPLETED || session.getStatus() == SwapSessionStatus.CANCELLED) {
            throw new IllegalStateException("Completed or cancelled sessions cannot be updated");
        }

        session.setScheduledAt(request.getScheduledAt());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setMeetingUrl(request.getMeetingUrl());
        session.setNotes(request.getNotes());
        session.setUpdatedAt(OffsetDateTime.now());
        SwapSession saved = sessionRepository.save(session);
        notifyParticipants(saved, NotificationType.SESSION_UPDATED);
        return sessionMapper.toResponse(saved);
    }

    private SwapSession loadSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
    }

    private void notifyParticipants(SwapSession session, NotificationType type) {
        notificationService.notifySessionStatusChange(session.getRequesterId(), type, session.getId());
        notificationService.notifySessionStatusChange(session.getResponderId(), type, session.getId());
    }
}
