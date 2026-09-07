package com.skillbridge.admin.api.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsResponse {
    private UUID id;
    private Integer registrationBonus;
    private Integer forumContributionReward;
    private Integer escrowReleaseHours;
    private UserSummaryResponse updatedBy;
    private OffsetDateTime updatedAt;
    private Long version;

    @JsonProperty("registrationBonusPoints")
    public Integer getRegistrationBonusPoints() {
        return registrationBonus;
    }

    @JsonProperty("helpfulForumContributionPoints")
    public Integer getHelpfulForumContributionPoints() {
        return forumContributionReward;
    }

    @JsonProperty("escrowAutoReleaseHours")
    public Integer getEscrowAutoReleaseHours() {
        return escrowReleaseHours;
    }
}
