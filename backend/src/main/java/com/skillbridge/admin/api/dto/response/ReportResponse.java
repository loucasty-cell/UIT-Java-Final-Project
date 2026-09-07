package com.skillbridge.admin.api.dto.response;

import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ReportResponse {
    private UUID id;
    private UserSummaryResponse reporter;
    private ReportTargetType targetType;
    private UUID targetId;
    private String reason;
    private String details;
    private String excerpt;
    private ReportStatus status;
    private String actionTaken;
    private UserSummaryResponse resolvedBy;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
