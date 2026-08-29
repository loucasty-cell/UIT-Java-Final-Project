package com.skillbridge.session.application;

import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.session.infrastructure.persistence.SessionConfirmationRepository;
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

        // First confirmation sets autoReleaseAt
        SessionResponse firstConfirm = fixture.service.completeSession(session.getId());
        assertNotNull(session.getAutoReleaseAt());

        // Other party confirms -> completes session
        TestAuthContext.loginAs(session.getResponderId());
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
    void doubleConfirmationTransitionsFromAwaitingToCompleted() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.STARTED);
        session.setPointCostSnapshot(25);
        fixture.sessions.put(session.getId(), session);

        // 1st participant confirms -> AWAITING_CONFIRMATION
        TestAuthContext.loginAs(session.getRequesterId());
        com.skillbridge.session.api.dto.response.SessionConfirmationResponse firstConf = fixture.service
                .confirmCompletion(session.getId());
        assertEquals(SwapSessionStatus.AWAITING_CONFIRMATION, firstConf.getStatus());
        assertTrue(firstConf.getConfirmedByMe());
        assertNotNull(firstConf.getAutoReleaseAt());

        // 2nd participant confirms -> COMPLETED + escrow points released
        TestAuthContext.loginAs(session.getResponderId());
        com.skillbridge.session.api.dto.response.SessionConfirmationResponse secondConf = fixture.service
                .confirmCompletion(session.getId());
        assertEquals(SwapSessionStatus.COMPLETED, secondConf.getStatus());
        assertTrue(secondConf.getConfirmedByMe());
        assertEquals(25, secondConf.getPointsReleased());
    }

    @Test
    void rejectsStartSessionByNonParticipant() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(UUID.randomUUID());

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> fixture.service.startSession(session.getId()));
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
                () -> fixture.service.startSession(session.getId()));
        assertEquals("Only accepted sessions can be started", exception.getMessage());
    }

    @Test
    void rejectsUpdateWhenCompletedOrCancelled() {
        Fixture fixture = new Fixture();
        SwapSession completed = session(SwapSessionStatus.COMPLETED);
        SwapSession cancelled = session(SwapSessionStatus.CANCELLED);
        fixture.sessions.put(completed.getId(), completed);
        fixture.sessions.put(cancelled.getId(), cancelled);

        TestAuthContext.loginAs(completed.getRequesterId());
        UpdateSessionRequest update = new UpdateSessionRequest();
        update.setNotes("Too late");

        IllegalStateException completedEx = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.updateSession(completed.getId(), update));
        assertTrue(completedEx.getMessage().contains("cannot be updated"));

        TestAuthContext.loginAs(cancelled.getRequesterId());
        IllegalStateException cancelledEx = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.updateSession(cancelled.getId(), update));
        assertTrue(cancelledEx.getMessage().contains("cannot be updated"));
    }

    @Test
    void rejectsInvalidUpdateParameters() {
        Fixture fixture = new Fixture();
        SwapSession session = session(SwapSessionStatus.ACCEPTED);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(session.getRequesterId());

        assertThrows(IllegalArgumentException.class,
                () -> fixture.service.updateSession(null, new UpdateSessionRequest()));
        assertThrows(IllegalArgumentException.class, () -> fixture.service.updateSession(session.getId(), null));

        UpdateSessionRequest invalidDuration = new UpdateSessionRequest();
        invalidDuration.setDurationMinutes(0);
        assertThrows(IllegalArgumentException.class,
                () -> fixture.service.updateSession(session.getId(), invalidDuration));
    }

    @Test
    void verifiesIdNullGuards() {
        Fixture fixture = new Fixture();
        assertThrows(IllegalArgumentException.class, () -> fixture.service.startSession(null));
        assertThrows(IllegalArgumentException.class, () -> fixture.service.completeSession(null));
    }

    private static SwapSession session(SwapSessionStatus status) {
        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(UUID.randomUUID());
        session.setRequesterId(UUID.randomUUID());
        session.setResponderId(UUID.randomUUID());
        session.setOfferedSkillId(UUID.randomUUID());
        session.setRequestedSkillId(UUID.randomUUID());
        session.setPointCost(10);
        session.setStatus(status);
        session.setAcceptedAt(OffsetDateTime.now());
        session.setCreatedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        session.setVersion(0L);
        return session;
    }

    private class Fixture {
        private final Map<UUID, SwapSession> sessions = new LinkedHashMap<>();
        private final List<UUID> confirmedUsers = new ArrayList<>();
        private final RecordingSwapService swapService = new RecordingSwapService(sessions);
        private final RecordingNotificationService notificationService = new RecordingNotificationService();
        private final SessionConfirmationRepository confirmationRepository = (SessionConfirmationRepository) Proxy
                .newProxyInstance(
                        SessionConfirmationRepository.class.getClassLoader(),
                        new Class<?>[] { SessionConfirmationRepository.class },
                        (proxy, method, args) -> switch (method.getName()) {
                            case "existsBySessionIdAndConfirmedBy" -> confirmedUsers.contains((UUID) args[1]);
                            case "save" -> {
                                confirmedUsers.add(com.skillbridge.shared.security.SecurityUtils.getCurrentUserId());
                                yield args[0];
                            }
                            default -> null;
                        });
        private final DisputeRepository disputeRepository = (DisputeRepository) Proxy.newProxyInstance(
                DisputeRepository.class.getClassLoader(),
                new Class<?>[] { DisputeRepository.class },
                (proxy, method, args) -> null);
        private final PlatformSettingRepository platformSettingRepository = (PlatformSettingRepository) Proxy
                .newProxyInstance(
                        PlatformSettingRepository.class.getClassLoader(),
                        new Class<?>[] { PlatformSettingRepository.class },
                        (proxy, method, args) -> Optional.empty());
        private final SessionService service = new SessionService(
                repository(),
                swapService,
                new SessionMapper(null),
                notificationService,
                disputeRepository,
                new AdminMapper(),
                confirmationRepository,
                platformSettingRepository);

        private SwapSessionRepository repository() {
            return (SwapSessionRepository) Proxy.newProxyInstance(
                    SwapSessionRepository.class.getClassLoader(),
                    new Class<?>[] { SwapSessionRepository.class },
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findById" -> Optional.ofNullable(sessions.get((UUID) args[0]));
                        case "save" -> {
                            SwapSession session = (SwapSession) args[0];
                            sessions.put(session.getId(), session);
                            yield session;
                        }
                        case "findActiveByUserId" -> sessions.values().stream()
                                .filter(session -> session.getRequesterId().equals(args[0])
                                        || session.getResponderId().equals(args[0]))
                                .filter(session -> ((List<?>) args[1]).contains(session.getStatus()))
                                .toList();
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "SwapSessionRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    });
        }
    }

    private static class RecordingSwapService extends SwapService {
        private final Map<UUID, SwapSession> sessions;
        private UUID completedSessionId;

        RecordingSwapService(Map<UUID, SwapSession> sessions) {
            super(null, null, null, null, null, null, null, null, null);
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

        private record RecordedNotification(UUID userId, NotificationType type, UUID sessionId) {
        }
    }
}
