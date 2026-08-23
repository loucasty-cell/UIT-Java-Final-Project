package com.skillbridge.session.application;

import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SessionServiceTest {

    @Test
    void fetchesActiveStartsUpdatesAndCompletesSessions() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);

        assertEquals(1, fixture.service.getActiveSwapSessions(session.getRequesterId()).size());

        SessionResponse started = fixture.service.startSession(session.getId());
        assertEquals(SwapSessionStatus.STARTED, started.getStatus());
        assertTrue(started.getStartedAt() != null);

        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setScheduledAt(OffsetDateTime.now().plusDays(1));
        update.setDurationMinutes(45);
        update.setMeetingUrl("https://meet.example/session");
        update.setNotes("Bring questions");
        SessionResponse updated = fixture.service.updateSession(session.getId(), update);
        assertEquals(45, updated.getDurationMinutes());
        assertEquals("Bring questions", updated.getNotes());

        SessionResponse completed = fixture.service.completeSession(session.getId());
        assertEquals(SwapSessionStatus.COMPLETED, completed.getStatus());
        assertEquals(session.getId(), fixture.swapService.completedSessionId);
    }

    private SwapSession session(SwapSessionStatus status) {
        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(UUID.randomUUID());
        session.setRequesterId(UUID.randomUUID());
        session.setResponderId(UUID.randomUUID());
        session.setOfferedSkillId(UUID.randomUUID());
        session.setRequestedSkillId(UUID.randomUUID());
        session.setPointCost(0);
        session.setStatus(status);
        session.setAcceptedAt(OffsetDateTime.now());
        session.setCreatedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        session.setVersion(0L);
        return session;
    }

    private class Fixture {
        private final Map<UUID, SwapSession> sessions = new LinkedHashMap<>();
        private final RecordingSwapService swapService = new RecordingSwapService(sessions);
        private final RecordingNotificationService notificationService = new RecordingNotificationService();
        private final SessionService service = new SessionService(
                repository(),
                swapService,
                new SessionMapper(null),
                notificationService
        );

        private SwapSessionRepository repository() {
            return SwapSessionRepository.class.cast(Proxy.newProxyInstance(
                    SwapSessionRepository.class.getClassLoader(),
                    new Class<?>[]{SwapSessionRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findById" -> Optional.ofNullable(sessions.get((UUID) args[0]));
                        case "save" -> {
                            SwapSession session = (SwapSession) args[0];
                            sessions.put(session.getId(), session);
                            yield session;
                        }
                        case "findActiveByUserId" -> sessions.values().stream()
                                .filter(session -> session.getRequesterId().equals(args[0]) || session.getResponderId().equals(args[0]))
                                .filter(session -> ((List<?>) args[1]).contains(session.getStatus()))
                                .toList();
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "SwapSessionRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }
    }

    private static class RecordingSwapService extends SwapService {
        private final Map<UUID, SwapSession> sessions;
        private UUID completedSessionId;

        RecordingSwapService(Map<UUID, SwapSession> sessions) {
            super(null, null, null, null, null, null, null, null);
            this.sessions = sessions;
        }

        @Override
        public SwapSessionResponse completeSwapSession(UUID sessionId) {
            this.completedSessionId = sessionId;
            SwapSession session = sessions.get(sessionId);
            session.setStatus(SwapSessionStatus.COMPLETED);
            session.setCompletedAt(OffsetDateTime.now());
            SwapSessionResponse response = new SwapSessionResponse();
            response.setId(sessionId);
            response.setStatus(SwapSessionStatus.COMPLETED);
            return response;
        }
    }

    private static class RecordingNotificationService extends NotificationService {
        RecordingNotificationService() {
            super(null, null);
        }

        @Override
        public void notifySessionStatusChange(UUID userId, NotificationType type, UUID sessionId) {
        }
    }
}
