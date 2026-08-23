package com.skillbridge.notification.application;

import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.api.mapper.NotificationMapper;
import com.skillbridge.notification.domain.entity.Notification;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.notification.infrastructure.persistence.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now());
        }
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    public void deleteNotification(UUID userId, UUID notificationId) {
        notificationRepository.deleteByIdAndUserId(notificationId, userId);
    }

    public NotificationResponse createNotification(
            UUID userId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            UUID referenceId
    ) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceType(referenceType);
        notification.setReferenceId(referenceId);
        notification.setCreatedAt(OffsetDateTime.now());
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    public void notifySwapProposalUpdate(UUID userId, NotificationType type, UUID swapRequestId) {
        createNotification(
                userId,
                type,
                "Swap proposal update",
                "A swap proposal changed status.",
                "SWAP_REQUEST",
                swapRequestId
        );
    }

    public void notifySessionStatusChange(UUID userId, NotificationType type, UUID sessionId) {
        createNotification(
                userId,
                type,
                "Session update",
                "A swap session changed status.",
                "SWAP_SESSION",
                sessionId
        );
    }

    public void notifyForumCommentReply(UUID postAuthorId, UUID commentId) {
        createNotification(
                postAuthorId,
                NotificationType.FORUM_COMMENT_REPLY,
                "New forum comment",
                "Someone commented on your forum post.",
                "FORUM_COMMENT",
                commentId
        );
    }
}
