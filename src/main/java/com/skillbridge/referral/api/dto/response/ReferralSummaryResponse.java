package com.skillbridge.referral.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReferralSummaryResponse {
    private String referralCode;
    private Long totalReferred;
    private Integer totalPointsEarned;
    private List<ReferralRewardResponse> rewards;
}
