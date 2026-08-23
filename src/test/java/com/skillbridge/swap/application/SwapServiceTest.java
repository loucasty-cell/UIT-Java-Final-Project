package com.skillbridge.swap.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.skill.domain.entity.Skill;
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
import com.skillbridge.wallet.domain.entity.Wallet;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SwapServiceTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    private final UUID requesterId = UUID.randomUUID();
    private final UUID responderId = UUID.randomUUID();
    private final UUID offeredSkillId = UUID.randomUUID();
    private final UUID requestedSkillId = UUID.randomUUID();

    @Test
    void createsPendingProposalWhenUsersSkillsAndPointsAreValid() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        fixture.addWallet(20);
        TestAuthContext.loginAs(requesterId);

        SwapRequestResponse response = fixture.service.createProposal(createRequest(10));

        assertEquals(SwapRequestStatus.PENDING, response.getStatus());
        assertEquals(requesterId, response.getRequester().getId());
        assertEquals("Java", response.getOfferedSkill().getName());
        assertEquals(10, response.getPointCost());
        assertFalse(fixture.walletService.holdCalled);
    }

    @Test
    void rejectsCreateWhenRequesterHasInsufficientPoints() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        fixture.addWallet(2);
        TestAuthContext.loginAs(requesterId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.createProposal(createRequest(10))
        );
        assertEquals("Insufficient available points", exception.getMessage());
    }

    @Test
    void acceptsPendingProposalAndHoldsPoints() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        SwapRequest proposal = pendingProposal(10);
        fixture.requests.put(proposal.getId(), proposal);
        TestAuthContext.loginAs(responderId);

        SwapRequestResponse response = fixture.service.acceptProposal(proposal.getId());

        assertEquals(SwapRequestStatus.ACCEPTED, response.getStatus());
        assertTrue(response.getPointsHeld());
        assertTrue(fixture.walletService.holdCalled);
        assertEquals(proposal.getId(), fixture.walletService.referenceId);
        assertEquals(10, fixture.walletService.amount);
    }

    @Test
    void rejectsPendingProposalWithoutHoldingPoints() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        SwapRequest proposal = pendingProposal(0);
        fixture.requests.put(proposal.getId(), proposal);
        TestAuthContext.loginAs(responderId);

        SwapRequestResponse response = fixture.service.rejectProposal(proposal.getId());

        assertEquals(SwapRequestStatus.REJECTED, response.getStatus());
        assertFalse(fixture.walletService.holdCalled);
    }

    @Test
    void completesAcceptedSessionAndReleasesHeldPoints() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        SwapRequest proposal = acceptedProposal(10);
        SwapSession session = acceptedSession(proposal);
        fixture.requests.put(proposal.getId(), proposal);
        fixture.sessions.put(session.getId(), session);
        TestAuthContext.loginAs(requesterId);

        SwapSessionResponse response = fixture.service.completeSwapSession(session.getId());

        assertEquals(SwapSessionStatus.COMPLETED, response.getStatus());
        assertTrue(fixture.walletService.releaseCalled);
        assertEquals(proposal.getId(), fixture.walletService.referenceId);
    }

    @Test
    void returnsUserSwapHistory() {
        Fixture fixture = new Fixture();
        fixture.addUsers();
        fixture.addSkills();
        SwapRequest proposal = acceptedProposal(0);
        fixture.requests.put(proposal.getId(), proposal);
        TestAuthContext.loginAs(requesterId);

        List<SwapRequestResponse> history = fixture.service.getSwapHistory();

        assertEquals(1, history.size());
        assertEquals(proposal.getId(), history.get(0).getId());
    }

    private CreateSwapProposalRequest createRequest(int pointCost) {
        CreateSwapProposalRequest request = new CreateSwapProposalRequest();
        request.setResponderId(responderId);
        request.setOfferedSkillId(offeredSkillId);
        request.setRequestedSkillId(requestedSkillId);
        request.setPointCost(pointCost);
        request.setMessage("Can we swap?");
        return request;
    }

    private SwapRequest pendingProposal(int pointCost) {
        SwapRequest proposal = new SwapRequest();
        proposal.setId(UUID.randomUUID());
        proposal.setRequesterId(requesterId);
        proposal.setResponderId(responderId);
        proposal.setOfferedSkillId(offeredSkillId);
        proposal.setRequestedSkillId(requestedSkillId);
        proposal.setPointCost(pointCost);
        proposal.setPointsHeld(false);
        proposal.setStatus(SwapRequestStatus.PENDING);
        proposal.setCreatedAt(OffsetDateTime.now());
        proposal.setUpdatedAt(OffsetDateTime.now());
        proposal.setVersion(0L);
        return proposal;
    }

    private SwapRequest acceptedProposal(int pointCost) {
        SwapRequest proposal = pendingProposal(pointCost);
        proposal.setStatus(SwapRequestStatus.ACCEPTED);
        proposal.setPointsHeld(pointCost > 0);
        proposal.setAcceptedAt(OffsetDateTime.now());
        return proposal;
    }

    private SwapSession acceptedSession(SwapRequest proposal) {
        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(proposal.getId());
        session.setRequesterId(requesterId);
        session.setResponderId(responderId);
        session.setOfferedSkillId(offeredSkillId);
        session.setRequestedSkillId(requestedSkillId);
        session.setPointCost(proposal.getPointCost());
        session.setStatus(SwapSessionStatus.ACCEPTED);
        session.setAcceptedAt(OffsetDateTime.now());
        session.setCreatedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        session.setVersion(0L);
        return session;
    }

    private class Fixture {
        private final Map<UUID, User> users = new LinkedHashMap<>();
        private final Map<UUID, Skill> skills = new LinkedHashMap<>();
        private final Map<UUID, Wallet> wallets = new LinkedHashMap<>();
        private final Map<UUID, SwapRequest> requests = new LinkedHashMap<>();
        private final Map<UUID, SwapSession> sessions = new LinkedHashMap<>();
        private final RecordingWalletService walletService = new RecordingWalletService();
        private final RecordingNotificationService notificationService = new RecordingNotificationService();
        private final UserRepository userRepository = userRepository();
        private final SkillRepository skillRepository = skillRepository();
        private final SwapSessionRepository sessionRepository = sessionRepository();
        private final SwapService service = new SwapService(
                requestRepository(),
                sessionRepository,
                userRepository,
                skillRepository,
                walletRepository(),
                walletService,
                new SwapMapper(userRepository, skillRepository, sessionRepository),
                notificationService
        );

        void addUsers() {
            users.put(requesterId, user(requesterId, "Requester"));
            users.put(responderId, user(responderId, "Responder"));
        }

        void addSkills() {
            skills.put(offeredSkillId, skill(offeredSkillId, "Java"));
            skills.put(requestedSkillId, skill(requestedSkillId, "Design"));
        }

        void addWallet(int availablePoints) {
            Wallet wallet = new Wallet();
            wallet.setId(UUID.randomUUID());
            wallet.setUserId(requesterId);
            wallet.setAvailablePoints(availablePoints);
            wallet.setHeldPoints(0);
            wallet.setTotalEarned(availablePoints);
            wallet.setTotalSpent(0);
            wallet.setCreatedAt(OffsetDateTime.now());
            wallet.setUpdatedAt(OffsetDateTime.now());
            wallet.setVersion(0L);
            wallets.put(requesterId, wallet);
        }

        private UserRepository userRepository() {
            return proxy(UserRepository.class, (methodName, args) -> switch (methodName) {
                case "existsById" -> users.containsKey((UUID) args[0]);
                case "findById" -> Optional.ofNullable(users.get((UUID) args[0]));
                default -> unsupported(methodName);
            });
        }

        private SkillRepository skillRepository() {
            return proxy(SkillRepository.class, (methodName, args) -> switch (methodName) {
                case "existsById" -> skills.containsKey((UUID) args[0]);
                case "findById" -> Optional.ofNullable(skills.get((UUID) args[0]));
                default -> unsupported(methodName);
            });
        }

        private WalletRepository walletRepository() {
            return proxy(WalletRepository.class, (methodName, args) -> switch (methodName) {
                case "findByUserId" -> Optional.ofNullable(wallets.get((UUID) args[0]));
                default -> unsupported(methodName);
            });
        }

        private SwapRequestRepository requestRepository() {
            return proxy(SwapRequestRepository.class, (methodName, args) -> switch (methodName) {
                case "save" -> {
                    SwapRequest request = (SwapRequest) args[0];
                    requests.put(request.getId(), request);
                    yield request;
                }
                case "findById" -> Optional.ofNullable(requests.get((UUID) args[0]));
                case "findByRequesterIdOrResponderIdOrderByCreatedAtDesc" -> requests.values().stream()
                        .filter(request -> args[0].equals(request.getRequesterId()) || args[1].equals(request.getResponderId()))
                        .toList();
                default -> unsupported(methodName);
            });
        }

        private SwapSessionRepository sessionRepository() {
            return proxy(SwapSessionRepository.class, (methodName, args) -> switch (methodName) {
                case "save" -> {
                    SwapSession session = (SwapSession) args[0];
                    sessions.put(session.getId(), session);
                    yield session;
                }
                case "findById" -> Optional.ofNullable(sessions.get((UUID) args[0]));
                case "findBySwapRequestId" -> sessions.values().stream()
                        .filter(session -> args[0].equals(session.getSwapRequestId()))
                        .findFirst();
                default -> unsupported(methodName);
            });
        }

        private User user(UUID id, String displayName) {
            User user = new User();
            user.setId(id);
            user.setEmail(displayName.toLowerCase() + "@skillbridge.edu");
            user.setFirstName(displayName);
            user.setLastName("User");
            user.setDisplayName(displayName);
            return user;
        }

        private Skill skill(UUID id, String name) {
            return Skill.builder()
                    .id(id)
                    .name(name)
                    .category("General")
                    .description(name)
                    .build();
        }
    }

    private interface MethodHandler {
        Object invoke(String methodName, Object[] args);
    }

    private static <T> T proxy(Class<T> type, MethodHandler handler) {
        return type.cast(Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class<?>[]{type},
                (proxy, method, args) -> switch (method.getName()) {
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "toString" -> type.getSimpleName() + " test proxy";
                    default -> handler.invoke(method.getName(), args);
                }
        ));
    }

    private static Object unsupported(String methodName) {
        throw new UnsupportedOperationException("Unsupported test repository method: " + methodName);
    }

    private static class RecordingWalletService extends WalletService {
        private boolean holdCalled;
        private boolean releaseCalled;
        private int amount;
        private UUID referenceId;

        RecordingWalletService() {
            super(null, null, null);
        }

        @Override
        public void holdPoints(
                UUID learnerId,
                UUID mentorId,
                int amount,
                String referenceType,
                UUID referenceId,
                String idempotencyKey
        ) {
            this.holdCalled = true;
            this.amount = amount;
            this.referenceId = referenceId;
        }

        @Override
        public void releaseHeldPoints(
                UUID learnerId,
                UUID mentorId,
                String referenceType,
                UUID referenceId,
                String idempotencyKey
        ) {
            this.releaseCalled = true;
            this.referenceId = referenceId;
        }
    }

    private static class RecordingNotificationService extends NotificationService {
        private NotificationType type;
        private UUID referenceId;

        RecordingNotificationService() {
            super(null, null);
        }

        @Override
        public void notifySwapProposalUpdate(UUID userId, NotificationType type, UUID swapRequestId) {
            this.type = type;
            this.referenceId = swapRequestId;
        }

        @Override
        public void notifySessionStatusChange(UUID userId, NotificationType type, UUID sessionId) {
            this.type = type;
            this.referenceId = sessionId;
        }
    }
}
