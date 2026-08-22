package com.skillbridge.auth.api.mapper;

import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.domain.entity.User;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class AuthMapper {

    public AuthResponse toAuthResponse(
            String accessToken,
            OffsetDateTime accessTokenExpiresAt,
            String refreshToken,
            User user,
            List<String> roles
    ) {
        String displayName = user.getFirstName() + " " + user.getLastName();

        AuthResponse.AuthUserResponse authUserResponse = AuthResponse.AuthUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(displayName)
                .roles(roles)
                .accountStatus(user.getStatus())
                .build();

        return AuthResponse.builder()
                .accessToken(accessToken)
                .accessTokenExpiresAt(accessTokenExpiresAt)
                .refreshToken(refreshToken)
                .user(authUserResponse)
                .build();
    }
}
