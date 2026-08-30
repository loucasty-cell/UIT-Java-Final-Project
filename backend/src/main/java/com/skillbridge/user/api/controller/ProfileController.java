package com.skillbridge.user.api.controller;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.user.api.dto.request.ProfileUpdateRequest;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.application.command.UserProfileService;
import com.skillbridge.user.application.query.UserProfileQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

// ProfileController: Exposes owner-only endpoints for viewing and updating the caller's profile
// Linkage: /api/v1/me -> SecurityUtils (JWT subject) -> UserProfileService (write), UserProfileQueryService (read)
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProfileController {

    private final UserProfileService userProfileService;

    private final UserProfileQueryService userProfileQueryService;

    // Returns the authenticated caller's safe profile projection
    // Linkage: GET /api/v1/me -> UserProfileQueryService.getMyProfile() -> MyProfileResponse
    @GetMapping("/me")
    public ResponseEntity<MyProfileResponse> getMyProfile() {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userProfileQueryService.getMyProfile(ownerId));
    }

    // Partially updates the caller's profile; If-Match carries the current version for optimistic locking
    // Linkage: PATCH /api/v1/me -> UserProfileService.updateProfile() -> updated MyProfileResponse + fresh ETag
    @PatchMapping("/me")
    public ResponseEntity<MyProfileResponse> updateMyProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @RequestHeader(value = "If-Match", required = false) String ifMatch
    ) {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        Long expectedVersion = parseVersion(ifMatch);

        User updatedUser = userProfileService.updateProfile(ownerId, request, expectedVersion);
        MyProfileResponse response = userProfileQueryService.toProfileResponse(updatedUser);

        return ResponseEntity.ok()
                .eTag("\"" + response.getVersion() + "\"")
                .body(response);
    }

    // Parses the quoted or bare version value from the If-Match header; null means missing
    private Long parseVersion(String ifMatch) {
        if (ifMatch == null || ifMatch.isBlank()) {
            return null;
        }
        try {
            String cleanVersion = ifMatch.replace("\"", "").trim();
            return Long.parseLong(cleanVersion);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
