package com.skillbridge.notification.api.controller;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.application.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:8081")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@PathVariable UUID userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @DeleteMapping("/users/{userId}/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable UUID userId,
            @PathVariable UUID notificationId
    ) {
        notificationService.deleteNotification(userId, notificationId);
        return ResponseEntity.noContent().build();
    }
}
