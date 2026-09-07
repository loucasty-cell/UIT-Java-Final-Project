package com.skillbridge.admin.domain.entity;

import com.skillbridge.admin.domain.model.DisputeResolution;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.shared.domain.model.Mode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "disputes")
@Getter
@Setter
public class Dispute {

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_mode", nullable = false, length = 50)
    private Mode sessionMode;

    @Column(name = "opened_by", nullable = false)
    private UUID openedBy;

    @Column(name = "reason", nullable = false, length = 100)
    private String reason;

    @Column(name = "details", nullable = false, length = 2000)
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DisputeStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolution", length = 50)
    private DisputeResolution resolution;

    @Column(name = "resolution_note", length = 2000)
    private String resolutionNote;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
