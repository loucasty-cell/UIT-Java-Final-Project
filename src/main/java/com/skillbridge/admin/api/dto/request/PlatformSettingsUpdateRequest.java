package com.skillbridge.admin.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PlatformSettingsUpdateRequest {

    @Min(value = 0, message = "Registration bonus points must be non-negative")
    @Max(value = 10000, message = "Registration bonus points cannot exceed 10000")
    private Integer registrationBonus;

    @Min(value = 0, message = "Forum contribution reward points must be non-negative")
    @Max(value = 10000, message = "Forum contribution reward points cannot exceed 10000")
    private Integer forumContributionReward;

    @Min(value = 1, message = "Escrow release hours must be at least 1")
    @Max(value = 168, message = "Escrow release hours cannot exceed 168 (1 week)")
    private Integer escrowReleaseHours;
}
