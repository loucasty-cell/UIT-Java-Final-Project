package com.skillbridge.admin.application.query;

import com.skillbridge.admin.api.dto.response.AdminAuditEventResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.AdminAuditEvent;
import com.skillbridge.admin.infrastructure.persistence.AdminAuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminAuditQueryService {

    private final AdminAuditEventRepository auditEventRepository;
    private final AdminMapper adminMapper;

    public Page<AdminAuditEventResponse> getAuditEvents(UUID actorId, String targetType, Pageable pageable) {
        Page<AdminAuditEvent> events;
        if (actorId != null && targetType != null) {
            events = auditEventRepository.findByActorIdAndTargetType(actorId, targetType, pageable);
        } else if (actorId != null) {
            events = auditEventRepository.findByActorId(actorId, pageable);
        } else if (targetType != null) {
            events = auditEventRepository.findByTargetType(targetType, pageable);
        } else {
            events = auditEventRepository.findAll(pageable);
        }

        return events.map(adminMapper::toResponse);
    }
}
