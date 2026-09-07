package com.skillbridge.moderation.api.dto.response;

import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ModerationReportResponse {
    private UUID id;
    private UUID reporterId;
    private ReportTargetType targetType;
    private UUID targetId;
    private String reason;
    private String details;
    private ReportStatus status;
    private String actionTaken;
    private UUID resolvedBy;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
