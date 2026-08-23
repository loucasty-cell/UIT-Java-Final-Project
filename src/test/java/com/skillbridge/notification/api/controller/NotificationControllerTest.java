package com.skillbridge.notification.api.controller;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.application.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NotificationControllerTest {

    @Test
    void exposesNotificationEndpoints() {
        RecordingNotificationService service = new RecordingNotificationService();
        NotificationController controller = new NotificationController(service);
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        assertEquals(1, controller.getUserNotifications(userId).getBody().size());
        assertEquals(userId, service.loadedUserId);
        assertEquals(notificationId, controller.markAsRead(notificationId).getBody().getId());
        assertEquals(notificationId, service.readId);
        assertEquals(HttpStatus.NO_CONTENT, controller.deleteNotification(userId, notificationId).getStatusCode());
        assertEquals(notificationId, service.deletedId);
    }

    private static class RecordingNotificationService extends NotificationService {
        private UUID loadedUserId;
        private UUID readId;
        private UUID deletedId;

        RecordingNotificationService() {
            super(null, null);
        }

        @Override
        public List<NotificationResponse> getUserNotifications(UUID userId) {
            this.loadedUserId = userId;
            NotificationResponse response = new NotificationResponse();
            response.setId(UUID.randomUUID());
            return List.of(response);
        }

        @Override
        public NotificationResponse markAsRead(UUID notificationId) {
            this.readId = notificationId;
            NotificationResponse response = new NotificationResponse();
            response.setId(notificationId);
            response.setRead(true);
            return response;
        }

        @Override
        public void deleteNotification(UUID userId, UUID notificationId) {
            this.deletedId = notificationId;
        }
    }
}
