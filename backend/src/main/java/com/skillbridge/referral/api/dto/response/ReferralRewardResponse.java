package com.skillbridge.referral.api.dto.response;

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
public class ReferralRewardResponse {
    private UUID id;
    private UUID referredUserId;
    private String referredUserName;
    private Integer pointsAwarded;
    private OffsetDateTime createdAt;
}
