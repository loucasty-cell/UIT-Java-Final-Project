package com.skillbridge.admin.api.dto.response;

import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminAuditEventResponse {
    private UUID id;
    private UserSummaryResponse actor;
    private String action;
    private String targetType;
    private UUID targetId;
    private String beforeSummary;
    private String afterSummary;
    private String reason;
    private String requestId;
    private OffsetDateTime timestamp;
}
