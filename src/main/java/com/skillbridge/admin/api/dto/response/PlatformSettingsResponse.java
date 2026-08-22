package com.skillbridge.admin.api.dto.response;

import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class PlatformSettingsResponse {
    private UUID id;
    private Integer registrationBonus;
    private Integer forumContributionReward;
    private Integer escrowReleaseHours;
    private UserSummaryResponse updatedBy;
    private OffsetDateTime updatedAt;
    private Long version;
}
