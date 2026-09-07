package com.skillbridge.auth.api.mapper;

import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.api.dto.response.AuthUserResponse;
import com.skillbridge.auth.domain.entity.User;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

// AuthMapper: Translates domain entities + issued tokens into API response DTOs
// Linkage: Used by RegistrationService, AuthenticationService, and RefreshTokenService
// Purpose: Keeps DTO assembly OUT of business services so mapping rules change in one place only
@Component
public class AuthMapper {

    // Builds the complete authentication payload returned by register / login / refresh endpoints
    // Linkage: Called as the LAST step of each auth use case, right before the controller responds
    public AuthResponse toAuthResponse(
            String accessToken,
            OffsetDateTime accessTokenExpiresAt,
            String refreshToken,
            User user,
            List<String> roles
    ) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .accessTokenExpiresAt(accessTokenExpiresAt)
                .refreshToken(refreshToken)
                .user(toAuthUserResponse(user, roles))
                .build();
    }

    // Maps a User entity to its SAFE public representation (no passwordHash, no version/audit fields)
    // Linkage: Reused inside toAuthResponse() so the user-shape rule exists in exactly one method
    public AuthUserResponse toAuthUserResponse(User user, List<String> roles) {
        // Compose display name once here instead of duplicating string concatenation in services
        String displayName = user.getFirstName() + " " + user.getLastName();

        return AuthUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(displayName)
                .roles(roles)
                .accountStatus(user.getStatus())
                .build();
    }
}
