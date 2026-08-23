package com.skillbridge.session.application;

import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SessionServiceTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void fetchesActiveStartsUpdatesAndCompletesSessions() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(session.getRequesterId());

        assertEquals(1, fixture.service.getActiveSwapSessions().size());

        SessionResponse started = fixture.service.startSession(session.getId());
        assertEquals(SwapSessionStatus.STARTED, started.getStatus());
        assertNotNull(started.getStartedAt());
        assertEquals(2, fixture.notificationService.recordedNotifications.size());

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

    @Test
    void allowsResponderToStartAndUpdateSession() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(session.getResponderId());

        SessionResponse started = fixture.service.startSession(session.getId());
        assertEquals(SwapSessionStatus.STARTED, started.getStatus());

        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setDurationMinutes(30);
        update.setNotes("Responder notes");
        SessionResponse updated = fixture.service.updateSession(session.getId(), update);
        assertEquals(30, updated.getDurationMinutes());
        assertEquals("Responder notes", updated.getNotes());
    }

    @Test
    void rejectsStartSessionByNonParticipant() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(UUID.randomUUID());

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> fixture.service.startSession(session.getId())
        );
        assertEquals("Only session participants can start this session", exception.getMessage());
    }

    @Test
    void rejectsStartSessionWhenStatusNotAccepted() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.STARTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(session.getRequesterId());

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.startSession(session.getId())
        );
        assertEquals("Only accepted sessions can be started", exception.getMessage());
    }

    @Test
    void rejectsStartSessionWhenNotFound() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(UUID.randomUUID());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.startSession(UUID.randomUUID())
        );
        assertTrue(exception.getMessage().contains("Session not found"));
    }

    @Test
    void rejectsUpdateSessionByNonParticipant() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(UUID.randomUUID());

        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setDurationMinutes(30);

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> fixture.service.updateSession(session.getId(), update)
        );
        assertEquals("Only session participants can update this session", exception.getMessage());
    }

    @Test
    void rejectsUpdateSessionWhenCompletedOrCancelled() {
        Fixture fixture = new Fixture();
        SwapSession completedSession = session(SwapSessionStatus.COMPLETED);
        SwapSession cancelledSession = session(SwapSessionStatus.CANCELLED);
        fixture.sessions.put(completedSession.getId(), completedSession);
        fixture.sessions.put(cancelledSession.getId(), cancelledSession);
        TestAuthContext.loginAs(completedSession.getRequesterId());

        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setDurationMinutes(30);

        IllegalStateException exception1 = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.updateSession(completedSession.getId(), update)
        );
        assertEquals("Completed or cancelled sessions cannot be updated", exception1.getMessage());

        TestAuthContext.loginAs(cancelledSession.getRequesterId());
        IllegalStateException exception2 = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.updateSession(cancelledSession.getId(), update)
        );
        assertEquals("Completed or cancelled sessions cannot be updated", exception2.getMessage());
    }

    @Test
    void rejectsUpdateSessionWithInvalidDuration() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(session.getRequesterId());

        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setDurationMinutes(0);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.updateSession(session.getId(), update)
        );
        assertEquals("Duration minutes must be at least 1", exception.getMessage());
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
        private final List<RecordedNotification> recordedNotifications = new ArrayList<>();

        RecordingNotificationService() {
            super(null, null);
        }

        @Override
        public void notifySessionStatusChange(UUID userId, NotificationType type, UUID sessionId) {
            recordedNotifications.add(new RecordedNotification(userId, type, sessionId));
        }

        private record RecordedNotification(UUID userId, NotificationType type, UUID sessionId) {}
    }
}
