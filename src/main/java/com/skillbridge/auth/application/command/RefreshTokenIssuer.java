package com.skillbridge.auth.application.command;

import com.skillbridge.auth.domain.entity.RefreshToken;
import com.skillbridge.auth.infrastructure.persistence.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.UUID;

// RefreshTokenIssuer: Single place responsible for creating and persisting refresh token records
// Linkage: Used by RegistrationService, AuthenticationService, and RefreshTokenService
// Purpose (DRY): Previously the "generate opaque token -> hash -> build entity -> save" logic was
// duplicated in three services; now all of them delegate here so the rotation rules live in ONE class
@Component
@RequiredArgsConstructor
public class RefreshTokenIssuer {

    // Generates opaque 64-char tokens and their SHA-256 hashes
    private final JwtTokenService jwtTokenService;

    // Persists refresh token records in the 'refresh_tokens' table
    private final RefreshTokenRepository refreshTokenRepository;

    // Issues a brand-new refresh token FAMILY (used on register and login)
    // Linkage: A new family means a fresh logout scope - revoking this family cannot affect other devices
    public String issueNewFamily(UUID userId) {
        return issue(userId, UUID.randomUUID());
    }

    // Issues a rotated refresh token INSIDE an existing family (used on /refresh endpoint)
    // Linkage: Keeps the same familyId so reuse detection can revoke the whole chain on attack
    public String issueRotated(UUID userId, UUID familyId) {
        return issue(userId, familyId);
    }

    // Core issuance routine: generates raw token, stores ONLY its hash, returns the raw token once
    // Linkage: The raw token is returned to the client; the database never sees plaintext tokens
    private String issue(UUID userId, UUID familyId) {
        // Step 1: Generate a cryptographically random opaque token to hand to the client
        String rawToken = jwtTokenService.generateOpaqueToken();

        // Step 2: Build the persistence record with only the SHA-256 hash of the token
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID());
        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(jwtTokenService.hashToken(rawToken));
        refreshToken.setFamilyId(familyId);

        OffsetDateTime now = OffsetDateTime.now();
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(now.plusDays(jwtTokenService.getRefreshTokenDays()));
        refreshToken.setRevoked(false);

        // Step 3: Persist the hashed record
        refreshTokenRepository.save(refreshToken);

        // Step 4: Return the raw token exactly once - it can never be retrieved again from storage
        return rawToken;
    }
}
