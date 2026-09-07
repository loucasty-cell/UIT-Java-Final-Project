package com.skillbridge.admin.infrastructure.persistence;

import com.skillbridge.admin.domain.entity.AdminAuditEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AdminAuditEventRepository extends JpaRepository<AdminAuditEvent, UUID> {
    Page<AdminAuditEvent> findByActorId(UUID actorId, Pageable pageable);
    Page<AdminAuditEvent> findByTargetType(String targetType, Pageable pageable);
    Page<AdminAuditEvent> findByActorIdAndTargetType(UUID actorId, String targetType, Pageable pageable);
}
