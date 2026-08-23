package com.skillbridge.notification.api.dto.response;

import com.skillbridge.notification.domain.model.NotificationType;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private String referenceType;
    private UUID referenceId;
    private Boolean read;
    private OffsetDateTime readAt;
    private OffsetDateTime createdAt;
}
