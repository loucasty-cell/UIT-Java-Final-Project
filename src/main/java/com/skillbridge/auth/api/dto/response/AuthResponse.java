package com.skillbridge.auth.api.dto.response;

import com.skillbridge.admin.domain.model.AccountStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private OffsetDateTime accessTokenExpiresAt;
    private String refreshToken;
    private AuthUserResponse user;

    @Data
    @Builder
    public static class AuthUserResponse {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String displayName;
        private List<String> roles;
        private AccountStatus accountStatus;
    }
}
