package com.skillbridge.admin.application.command;

import com.skillbridge.admin.domain.entity.AdminAuditEvent;
import com.skillbridge.admin.infrastructure.persistence.AdminAuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditEventRepository auditEventRepository;

    public void logEvent(
            UUID actorId,
            String action,
            String targetType,
            UUID targetId,
            String beforeSummary,
            String afterSummary,
            String reason,
            String requestId
    ) {
        AdminAuditEvent event = new AdminAuditEvent();
        event.setId(UUID.randomUUID());
        event.setActorId(actorId);
        event.setAction(action);
        event.setTargetType(targetType);
        event.setTargetId(targetId);
        event.setBeforeSummary(beforeSummary);
        event.setAfterSummary(afterSummary);
        event.setReason(reason);
        event.setRequestId(requestId != null ? requestId : UUID.randomUUID().toString());
        event.setTimestamp(OffsetDateTime.now());

        auditEventRepository.save(event);
    }
}
