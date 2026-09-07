package com.skillbridge.admin.api.dto.response;

import com.skillbridge.admin.domain.model.DisputeResolution;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Mode;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class DisputeResponse {
    private UUID id;
    private UUID sessionId;
    private Mode sessionMode;
    private UserSummaryResponse openedBy;
    private String reason;
    private String details;
    private DisputeStatus status;
    private DisputeResolution resolution;
    private String resolutionNote;
    private UserSummaryResponse resolvedBy;
    private OffsetDateTime resolvedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
