package com.skillbridge.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_events")
@Getter
@Setter
public class AdminAuditEvent {

    @Id
    private UUID id;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "target_type", nullable = false, length = 50)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "before_summary", length = 2000)
    private String beforeSummary;

    @Column(name = "after_summary", length = 2000)
    private String afterSummary;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "timestamp", nullable = false)
    private OffsetDateTime timestamp;
}
