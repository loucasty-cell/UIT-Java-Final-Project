package com.skillbridge.notification.api.controller;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NotificationControllerTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void exposesNotificationEndpoints() {
        RecordingNotificationService service = new RecordingNotificationService();
        NotificationController controller = new NotificationController(service);
        UUID userId = UUID.randomUUID();
        UUID notificationId = UUID.randomUUID();

        TestAuthContext.loginAs(userId);

        assertEquals(1, controller.getCurrentUserNotifications().getBody().size());
        assertEquals(userId, service.loadedUserId);
        assertEquals(notificationId, controller.markAsRead(notificationId).getBody().getId());
        assertEquals(notificationId, service.readId);
        assertEquals(HttpStatus.NO_CONTENT, controller.deleteNotification(notificationId).getStatusCode());
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
        public List<NotificationResponse> getUserNotifications() {
            this.loadedUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
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
        public void deleteNotification(UUID notificationId) {
            this.deletedId = notificationId;
        }
    }
}
