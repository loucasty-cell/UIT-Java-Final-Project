package com.skillbridge.notification.application;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.api.mapper.NotificationMapper;
import com.skillbridge.notification.domain.entity.Notification;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.notification.infrastructure.persistence.NotificationRepository;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

public class NotificationV2Test {

    private final UUID currentUserId = UUID.randomUUID();
    private FakeNotificationRepository notificationRepository;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        TestAuthContext.loginAs(currentUserId);
        notificationRepository = new FakeNotificationRepository();
        notificationService = new NotificationService(notificationRepository, new NotificationMapper());
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void markAllAsRead_and_unreadCount() {
        notificationService.createNotification(currentUserId, NotificationType.SWAP_PROPOSAL_CREATED, "Title 1", "Msg 1", "SWAP", UUID.randomUUID());
        notificationService.createNotification(currentUserId, NotificationType.SESSION_STARTED, "Title 2", "Msg 2", "SESSION", UUID.randomUUID());

        assertEquals(2, notificationService.getUnreadCount());

        notificationService.markAllAsRead();

        assertEquals(0, notificationService.getUnreadCount());
    }

    private static class FakeNotificationRepository implements NotificationRepository {
        private final Map<UUID, Notification> store = new HashMap<>();

        @Override
        public List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId) {
            return store.values().stream()
                    .filter(n -> n.getUserId().equals(userId))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }

        @Override
        public Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public long countByUserIdAndReadAtIsNull(UUID userId) {
            return store.values().stream()
                    .filter(n -> n.getUserId().equals(userId) && n.getReadAt() == null)
                    .count();
        }

        @Override
        public void markAllAsRead(UUID userId, OffsetDateTime now) {
            store.values().stream()
                    .filter(n -> n.getUserId().equals(userId) && n.getReadAt() == null)
                    .forEach(n -> n.setReadAt(now));
        }

        @Override
        public <S extends Notification> S save(S entity) {
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            if (entity.getCreatedAt() == null) entity.setCreatedAt(OffsetDateTime.now());
            store.put(entity.getId(), entity);
            return entity;
        }

        @Override public Optional<Notification> findById(UUID uuid) { return Optional.ofNullable(store.get(uuid)); }
        @Override public boolean existsById(UUID uuid) { return store.containsKey(uuid); }
        @Override public List<Notification> findAll() { return new ArrayList<>(store.values()); }
        @Override public List<Notification> findAllById(Iterable<UUID> uuids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(UUID uuid) { store.remove(uuid); }
        @Override public void delete(Notification entity) { store.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> uuids) {}
        @Override public void deleteAll(Iterable<? extends Notification> entities) {}
        @Override public void deleteAll() { store.clear(); }
        @Override public void flush() {}
        @Override public <S extends Notification> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Notification> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<Notification> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> uuids) {}
        @Override public void deleteAllInBatch() {}
        @Override public Notification getOne(UUID uuid) { return store.get(uuid); }
        @Override public Notification getById(UUID uuid) { return store.get(uuid); }
        @Override public Notification getReferenceById(UUID uuid) { return store.get(uuid); }
        @Override public <S extends Notification> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Notification> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends Notification> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends Notification> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends Notification> long count(Example<S> example) { return 0; }
        @Override public <S extends Notification> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Notification, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends Notification> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<Notification> findAll(Sort sort) { return List.of(); }
        @Override public Page<Notification> findAll(Pageable pageable) { return Page.empty(); }
    }
}

