package com.skillbridge.auth.application.command;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

// JwtTokenService: Generates signed 12-hour HMAC-SHA256 JWT access tokens and cryptographically hashes refresh tokens
// Linkage: Used by RegistrationService, AuthenticationService, and RefreshTokenService for token creation and validation
@Service
public class JwtTokenService {

    // Shared secret key for HMAC-SHA256 signing and decoding
    @Value("${skillbridge.security.jwt.secret}")
    private String jwtSecret;

    // Configured token duration: 12 hours = 720 minutes
    @Getter
    @Value("${skillbridge.security.jwt.access-token-minutes:720}")
    private long accessTokenMinutes;

    // Configured refresh token retention duration in days
    @Getter
    @Value("${skillbridge.security.jwt.refresh-token-days:7}")
    private long refreshTokenDays;

    // Value record holding generated serialized JWT string and UTC expiration timestamp
    public record TokenResult(String token, OffsetDateTime expiresAt) {}

    // Generates a 12-hour HMAC-SHA256 signed JWT with user ID (sub), email, roles, and account status claims
    // Linkage: Called when creating tokens during register(), login(), or refreshToken()
    public TokenResult generateAccessToken(UUID userId, String email, List<String> roles, String status) {
        try {
            Instant now = Instant.now();
            Instant expiration = now.plus(accessTokenMinutes, ChronoUnit.MINUTES);

            JWSSigner signer = new MACSigner(jwtSecret.getBytes(StandardCharsets.UTF_8));

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(userId.toString())
                    .issuer("skillbridge")
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(expiration))
                    .claim("email", email)
                    .claim("roles", roles)
                    .claim("status", status)
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet);
            signedJWT.sign(signer);

            String token = signedJWT.serialize();
            OffsetDateTime expiresAt = expiration.atOffset(ZoneOffset.UTC);

            return new TokenResult(token, expiresAt);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT access token", e);
        }
    }

    // Generates a cryptographically random 64-character opaque refresh token string
    // Linkage: Called by auth services to produce raw token returned to client
    public String generateOpaqueToken() {
        return UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    }

    // Hashes an opaque refresh token using SHA-256 for secure persistence in the database
    // Linkage: Ensures database stores only token hashes rather than plaintext tokens
    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
