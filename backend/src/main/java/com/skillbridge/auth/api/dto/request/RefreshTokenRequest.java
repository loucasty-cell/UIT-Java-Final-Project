package com.skillbridge.auth.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// RefreshTokenRequest: Incoming payload for POST /api/v1/auth/refresh and POST /api/v1/auth/logout
// Linkage: Deserialized by AuthController -> Consumed by RefreshTokenService.refreshToken() / logout()
// The client sends the raw opaque token; the service hashes it (SHA-256) before any database lookup
@Data
public class RefreshTokenRequest {

    // Raw 64-character opaque refresh token previously issued by RefreshTokenIssuer
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
