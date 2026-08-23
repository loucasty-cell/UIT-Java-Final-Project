package com.skillbridge.notification.application;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.api.mapper.NotificationMapper;
import com.skillbridge.notification.domain.entity.Notification;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.notification.infrastructure.persistence.NotificationRepository;
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

public class NotificationServiceTest {

    @Test
    void createsFetchesMarksReadAndDeletesNotifications() {
        Map<UUID, Notification> notifications = new LinkedHashMap<>();
        NotificationService service = new NotificationService(repository(notifications), new NotificationMapper());
        UUID userId = UUID.randomUUID();
        UUID referenceId = UUID.randomUUID();

        NotificationResponse created = service.createNotification(
                userId,
                NotificationType.SWAP_PROPOSAL_CREATED,
                "Title",
                "Message",
                "SWAP_REQUEST",
                referenceId
        );

        assertEquals(1, service.getUserNotifications(userId).size());
        assertEquals(referenceId, created.getReferenceId());
        assertEquals(false, created.getRead());

        NotificationResponse read = service.markAsRead(created.getId());
        assertTrue(read.getRead());

        service.deleteNotification(userId, created.getId());
        assertEquals(0, service.getUserNotifications(userId).size());
    }

    private NotificationRepository repository(Map<UUID, Notification> notifications) {
        return NotificationRepository.class.cast(Proxy.newProxyInstance(
                NotificationRepository.class.getClassLoader(),
                new Class<?>[]{NotificationRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        Notification notification = (Notification) args[0];
                        if (notification.getId() == null) {
                            notification.setId(UUID.randomUUID());
                        }
                        if (notification.getCreatedAt() == null) {
                            notification.setCreatedAt(OffsetDateTime.now());
                        }
                        notifications.put(notification.getId(), notification);
                        yield notification;
                    }
                    case "findById" -> Optional.ofNullable(notifications.get((UUID) args[0]));
                    case "findByUserIdOrderByCreatedAtDesc" -> notifications.values().stream()
                            .filter(notification -> notification.getUserId().equals(args[0]))
                            .toList();
                    case "deleteByIdAndUserId" -> {
                        notifications.remove((UUID) args[0]);
                        yield null;
                    }
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "toString" -> "NotificationRepository test proxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        ));
    }
}
