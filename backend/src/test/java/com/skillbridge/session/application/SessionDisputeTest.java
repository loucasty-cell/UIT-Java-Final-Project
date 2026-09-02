package com.skillbridge.session.application;

import com.skillbridge.admin.api.dto.request.DisputeResolutionRequest;
import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.application.command.AdminAuditService;
import com.skillbridge.admin.application.command.AdminDisputeService;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeResolution;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.notification.api.mapper.NotificationMapper;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.infrastructure.persistence.NotificationRepository;
import com.skillbridge.session.api.dto.request.CreateDisputeRequest;
import com.skillbridge.session.api.mapper.SessionMapper;
import com.skillbridge.session.infrastructure.persistence.SessionConfirmationRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

public class SessionDisputeTest {

    private final UUID requesterId = UUID.randomUUID();
    private final UUID responderId = UUID.randomUUID();
    private final UUID adminId = UUID.randomUUID();
    private final UUID sessionId = UUID.randomUUID();
    private final UUID swapRequestId = UUID.randomUUID();

    private FakeDisputeRepository disputeRepository;
    private FakeSwapSessionRepository sessionRepository;
    private FakeSwapRequestRepository requestRepository;
    private FakeWalletService walletService;

    private SessionService sessionService;
    private AdminDisputeService adminDisputeService;

    @BeforeEach
    void setUp() {
        disputeRepository = new FakeDisputeRepository();
        sessionRepository = new FakeSwapSessionRepository();
        requestRepository = new FakeSwapRequestRepository();
        walletService = new FakeWalletService();

        SwapRequest request = new SwapRequest();
        request.setId(swapRequestId);
        request.setRequesterId(requesterId);
        request.setResponderId(responderId);
        request.setPointCost(25);
        request.setPointsHeld(true);
        request.setStatus(SwapRequestStatus.ACCEPTED);
        requestRepository.save(request);

        SwapSession session = new SwapSession();
        session.setId(sessionId);
        session.setSwapRequestId(swapRequestId);
        session.setRequesterId(requesterId);
        session.setResponderId(responderId);
        session.setOfferedSkillId(UUID.randomUUID());
        session.setRequestedSkillId(UUID.randomUUID());
        session.setPointCost(25);
        session.setStatus(SwapSessionStatus.STARTED);
        sessionRepository.save(session);

        NotificationRepository notificationRepository = (NotificationRepository) Proxy.newProxyInstance(
                NotificationRepository.class.getClassLoader(),
                new Class<?>[]{NotificationRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> args[0];
                    default -> null;
                }
        );
        NotificationService notificationService = new NotificationService(notificationRepository, new NotificationMapper());

        sessionService = new SessionService(
                sessionRepository,
                new DummySwapService(),
                new SessionMapper(null),
                notificationService,
                disputeRepository,
                new AdminMapper(),
                (SessionConfirmationRepository) Proxy.newProxyInstance(SessionConfirmationRepository.class.getClassLoader(), new Class<?>[]{SessionConfirmationRepository.class}, (p, m, a) -> null),
                (PlatformSettingRepository) Proxy.newProxyInstance(PlatformSettingRepository.class.getClassLoader(), new Class<?>[]{PlatformSettingRepository.class}, (p, m, a) -> Optional.empty())
        );

        AdminAuditService auditService = new DummyAdminAuditService();

        adminDisputeService = new AdminDisputeService(
                disputeRepository,
                new AdminMapper(),
                auditService,
                sessionRepository,
                requestRepository,
                walletService
        );
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void opensDisputeAndAdminResolvesWithRefund() {
        TestAuthContext.loginAs(requesterId);
        CreateDisputeRequest request = new CreateDisputeRequest("Mentor missed meeting", "No show on Zoom link");
        DisputeResponse opened = sessionService.openDispute(sessionId, request);

        assertNotNull(opened);
        assertEquals(DisputeStatus.OPEN, opened.getStatus());

        SwapSession session = sessionRepository.findById(sessionId).orElseThrow();
        assertEquals(SwapSessionStatus.DISPUTED, session.getStatus());

        // Admin resolves
        TestAuthContext.loginAs(adminId);
        DisputeResolutionRequest resolveReq = new DisputeResolutionRequest();
        resolveReq.setResolution(DisputeResolution.REFUND_LEARNER);
        resolveReq.setNote("Learner refunded because mentor was absent");
        DisputeResponse resolved = adminDisputeService.resolveDispute(opened.getId(), resolveReq);

        assertEquals(DisputeStatus.RESOLVED, resolved.getStatus());
        assertEquals(DisputeResolution.REFUND_LEARNER, resolved.getResolution());
        assertTrue(walletService.refunded);

        SwapSession updatedSession = sessionRepository.findById(sessionId).orElseThrow();
        assertEquals(SwapSessionStatus.CANCELLED, updatedSession.getStatus());
    }

    private static class DummySwapService extends SwapService {
        DummySwapService() {
            super(null, null, null, null, null, null, null, null, null);
        }
    }

    private static class DummyAdminAuditService extends AdminAuditService {
        DummyAdminAuditService() {
            super(null);
        }
        @Override
        public void logEvent(UUID actorId, String action, String targetType, UUID targetId, String beforeSummary, String afterSummary, String reason, String requestId) {
        }
    }

    private static class FakeDisputeRepository implements DisputeRepository {
        private final Map<UUID, Dispute> store = new HashMap<>();

        @Override public Optional<Dispute> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable) { return Page.empty(); }
        @Override public Optional<Dispute> findBySessionId(UUID sessionId) { return store.values().stream().filter(d -> d.getSessionId().equals(sessionId)).findFirst(); }
        @Override public long countByStatus(DisputeStatus status) { return store.values().stream().filter(d -> d.getStatus() == status).count(); }
        @Override public <S extends Dispute> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            if (entity.getCreatedAt() == null) entity.setCreatedAt(OffsetDateTime.now());
            if (entity.getUpdatedAt() == null) entity.setUpdatedAt(OffsetDateTime.now());
            store.put(entity.getId(), entity);
            return entity;
        }
        @Override public List<Dispute> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<Dispute> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(Dispute entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends Dispute> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends Dispute> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Dispute> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<Dispute> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public Dispute getOne(UUID uuid) { return store.get(uuid); }
        @Override public Dispute getById(UUID uuid) { return store.get(uuid); }
        @Override public Dispute getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends Dispute> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Dispute> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends Dispute> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends Dispute> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends Dispute> long count(Example<S> example) { return 0; }
        @Override public <S extends Dispute> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Dispute, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends Dispute> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<Dispute> findAll(Sort sort) { return List.of(); }
        @Override public Page<Dispute> findAll(Pageable pageable) { return Page.empty(); }
    }

    private static class FakeSwapSessionRepository implements SwapSessionRepository {
        private final Map<UUID, SwapSession> store = new HashMap<>();

        @Override public Optional<SwapSession> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public Optional<SwapSession> findBySwapRequestId(UUID swapRequestId) { return store.values().stream().filter(s -> s.getSwapRequestId().equals(swapRequestId)).findFirst(); }
        @Override public List<SwapSession> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId) { return List.of(); }
        @Override public List<SwapSession> findActiveByUserId(UUID userId, List<SwapSessionStatus> statuses) { return List.of(); }
        @Override public List<SwapSession> findAllByUserId(UUID userId) { return List.of(); }
        @Override public List<SwapSession> findByUserIdAndStatus(UUID userId, SwapSessionStatus status) { return List.of(); }
        @Override public List<SwapSession> findSessionsInDateRange(UUID userId, OffsetDateTime startDate, OffsetDateTime endDate) { return List.of(); }
        @Override public List<SwapSession> findSessionsEligibleForAutoRelease(List<SwapSessionStatus> statuses, OffsetDateTime now) { return List.of(); }
        @Override public List<SwapSession> findConflictingSessions(UUID userId, OffsetDateTime bufferStart, OffsetDateTime bufferEnd, List<SwapSessionStatus> statuses) { return List.of(); }
        @Override public long countCompletedSessionsByUserId(UUID userId) { return 0L; }
        @Override public long countTaughtSessionsByUserId(UUID userId) { return 0L; }
        @Override public long countCompletedSwapsByUserId(UUID userId) { return 0L; }
        @Override public long countVolunteerSessionsByUserId(UUID userId) { return 0L; }
        @Override public <S extends SwapSession> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            store.put(entity.getId(), entity);
            return entity;
        }
        @Override public List<SwapSession> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<SwapSession> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(SwapSession entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends SwapSession> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends SwapSession> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends SwapSession> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<SwapSession> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public SwapSession getOne(UUID uuid) { return store.get(uuid); }
        @Override public SwapSession getById(UUID uuid) { return store.get(uuid); }
        @Override public SwapSession getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends SwapSession> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends SwapSession> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends SwapSession> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends SwapSession> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends SwapSession> long count(Example<S> example) { return 0; }
        @Override public <S extends SwapSession> boolean exists(Example<S> example) { return false; }
        @Override public <S extends SwapSession, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends SwapSession> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<SwapSession> findAll(Sort sort) { return List.of(); }
        @Override public Page<SwapSession> findAll(Pageable pageable) { return Page.empty(); }
    }

    private static class FakeSwapRequestRepository implements SwapRequestRepository {
        private final Map<UUID, SwapRequest> store = new HashMap<>();

        @Override public Optional<SwapRequest> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public List<SwapRequest> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId) { return List.of(); }
        @Override public List<SwapRequest> findByStatusAndCreatedAtBefore(SwapRequestStatus status, OffsetDateTime before) { return List.of(); }
        @Override public <S extends SwapRequest> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            store.put(entity.getId(), entity);
            return entity;
        }
        @Override public List<SwapRequest> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<SwapRequest> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(SwapRequest entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends SwapRequest> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends SwapRequest> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends SwapRequest> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<SwapRequest> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public SwapRequest getOne(UUID uuid) { return store.get(uuid); }
        @Override public SwapRequest getById(UUID uuid) { return store.get(uuid); }
        @Override public SwapRequest getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends SwapRequest> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends SwapRequest> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends SwapRequest> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends SwapRequest> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends SwapRequest> long count(Example<S> example) { return 0; }
        @Override public <S extends SwapRequest> boolean exists(Example<S> example) { return false; }
        @Override public <S extends SwapRequest, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends SwapRequest> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<SwapRequest> findAll(Sort sort) { return List.of(); }
        @Override public Page<SwapRequest> findAll(Pageable pageable) { return Page.empty(); }
    }

    @Test
    void testResolvingAlreadyResolvedDisputeIsIdempotent() {
        TestAuthContext.loginAs(adminId);
        // Arrange: Create and resolve a dispute
        Dispute dispute = new Dispute();
        dispute.setId(UUID.randomUUID());
        dispute.setSessionId(sessionId);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setReason("Session not completed");
        disputeRepository.save(dispute);

        DisputeResolutionRequest request = new DisputeResolutionRequest();
        request.setResolution(DisputeResolution.RELEASE_TO_MENTOR);
        request.setNote("Points released");

        // Act: Resolve the dispute first time
        DisputeResponse response1 = adminDisputeService.resolveDispute(dispute.getId(), request);
        assertNotNull(response1);
        assertEquals(DisputeStatus.RESOLVED, response1.getStatus(), "First resolution should succeed");

        // Arrange: Modify request to try different resolution
        request.setResolution(DisputeResolution.REFUND_LEARNER);
        request.setNote("Changed to refund");

        // Act: Attempt to resolve again - should return same as first resolution (idempotent)
        DisputeResponse response2 = adminDisputeService.resolveDispute(dispute.getId(), request);

        // Assert: Second call returns same resolution as first
        assertNotNull(response2);
        assertEquals(DisputeStatus.RESOLVED, response2.getStatus(), "Second resolution should be idempotent");
        assertEquals(DisputeResolution.RELEASE_TO_MENTOR, response2.getResolution(),
                "Resolution should remain unchanged after second call (idempotent)");
    }

    @Test
    void testResolvingDisputeOnCancelledSessionThrowsError() {
        TestAuthContext.loginAs(adminId);
        // Arrange: Create dispute with cancelled session
        SwapSession cancelledSession = new SwapSession();
        cancelledSession.setId(sessionId);
        cancelledSession.setSwapRequestId(swapRequestId);
        cancelledSession.setStatus(SwapSessionStatus.CANCELLED);
        cancelledSession.setRequesterId(requesterId);
        cancelledSession.setResponderId(responderId);
        sessionRepository.save(cancelledSession);

        Dispute dispute = new Dispute();
        dispute.setId(UUID.randomUUID());
        dispute.setSessionId(sessionId);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setReason("Cancelled session dispute");
        disputeRepository.save(dispute);

        DisputeResolutionRequest request = new DisputeResolutionRequest();
        request.setResolution(DisputeResolution.RELEASE_TO_MENTOR);
        request.setNote("Should fail");

        // Act & Assert: Should throw exception for cancelled session
        assertThrows(Exception.class, () -> {
            adminDisputeService.resolveDispute(dispute.getId(), request);
        }, "Should not allow resolving dispute on cancelled session");
    }

    @Test
    void testRefundResolutionCancelsSwap() {
        TestAuthContext.loginAs(adminId);
        // Arrange: Create dispute with points held
        Dispute dispute = new Dispute();
        dispute.setId(UUID.randomUUID());
        dispute.setSessionId(sessionId);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setReason("Learner requested refund");
        disputeRepository.save(dispute);

        DisputeResolutionRequest request = new DisputeResolutionRequest();
        request.setResolution(DisputeResolution.REFUND_LEARNER);
        request.setNote("Refund processed");

        // Act: Resolve with refund
        adminDisputeService.resolveDispute(dispute.getId(), request);

        // Assert: Swap request should be cancelled
        SwapRequest updatedRequest = requestRepository.findById(swapRequestId).orElse(null);
        assertTrue(updatedRequest != null && updatedRequest.getStatus() == SwapRequestStatus.CANCELLED,
                "Swap request should be cancelled after refund resolution");
        assertTrue(!updatedRequest.getPointsHeld(),
                "Points should no longer be held");

        // Assert: Session should be cancelled
        SwapSession updatedSession = sessionRepository.findById(sessionId).orElse(null);
        assertTrue(updatedSession != null && updatedSession.getStatus() == SwapSessionStatus.CANCELLED,
                "Session should be cancelled after refund resolution");

        // Assert: Wallet refund should be called
        assertTrue(walletService.refunded,
                "Wallet refund should have been called");
    }

    private static class FakeWalletService extends WalletService {
        boolean released = false;
        boolean refunded = false;

        FakeWalletService() {
            super(null, null, null);
        }

        @Override
        public void releaseHeldPoints(UUID learnerId, UUID mentorId, String referenceType, UUID referenceId, String idempotencyKey) {
            this.released = true;
        }

        @Override
        public void refundHeldPoints(UUID learnerId, String referenceType, UUID referenceId, String idempotencyKey) {
            this.refunded = true;
        }
    }
}


