package com.skillbridge.auth.api.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

// AuthResponse: Standard authentication payload returned by register, login, and refresh endpoints
// Linkage: Assembled by AuthMapper.toAuthResponse() -> Returned by AuthController to the HTTP client
// Contains: JWT access token + its expiry, opaque refresh token, and the safe user profile summary
@Data
@Builder
public class AuthResponse {

    // Signed HMAC-SHA256 JWT used as Bearer token for protected API calls (12-hour default lifespan)
    private String accessToken;

    // UTC timestamp when the access token expires; frontend uses it to schedule silent refresh
    private OffsetDateTime accessTokenExpiresAt;

    // Opaque 64-character refresh token; only sent once, database stores only its SHA-256 hash
    private String refreshToken;

    // Safe profile summary of the authenticated user (see AuthUserResponse)
    private AuthUserResponse user;
}
