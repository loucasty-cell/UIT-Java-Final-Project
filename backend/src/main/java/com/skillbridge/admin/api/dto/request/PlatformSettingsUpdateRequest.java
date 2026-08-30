package com.skillbridge.admin.api.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PlatformSettingsUpdateRequest {

    @Min(value = 0, message = "Registration bonus points must be non-negative")
    @Max(value = 10000, message = "Registration bonus points cannot exceed 10000")
    @JsonAlias({"registrationBonusPoints", "registration_bonus_points"})
    private Integer registrationBonus;

    @Min(value = 0, message = "Forum contribution reward points must be non-negative")
    @Max(value = 10000, message = "Forum contribution reward points cannot exceed 10000")
    @JsonAlias({"helpfulForumContributionPoints", "helpful_forum_contribution_points", "helpfulReward"})
    private Integer forumContributionReward;

    @Min(value = 1, message = "Escrow release hours must be at least 1")
    @Max(value = 168, message = "Escrow release hours cannot exceed 168 (1 week)")
    @JsonAlias({"escrowAutoReleaseHours", "escrow_auto_release_hours"})
    private Integer escrowReleaseHours;

    public Integer getRegistrationBonus() {
        return registrationBonus;
    }

    public Integer getForumContributionReward() {
        return forumContributionReward;
    }

    public Integer getEscrowReleaseHours() {
        return escrowReleaseHours;
    }
}
