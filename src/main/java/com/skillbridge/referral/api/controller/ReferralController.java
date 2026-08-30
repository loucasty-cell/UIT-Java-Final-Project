package com.skillbridge.referral.api.controller;

import com.skillbridge.referral.api.dto.response.ReferralSummaryResponse;
import com.skillbridge.referral.application.ReferralService;
import com.skillbridge.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
@Tag(name = "Referral System", description = "Endpoints for referral codes and referral rewards tracking")
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping("/referral-code")
    @Operation(summary = "Get or generate current user's referral code")
    public ResponseEntity<Map<String, String>> getReferralCode() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        String code = referralService.getOrCreateReferralCode(currentUserId);
        return ResponseEntity.ok(Map.of("referralCode", code));
    }

    @GetMapping("/referrals")
    @Operation(summary = "Get summary of user referrals and earned bonus points")
    public ResponseEntity<ReferralSummaryResponse> getReferrals() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        ReferralSummaryResponse response = referralService.getMyReferrals(currentUserId);
        return ResponseEntity.ok(response);
    }
}
