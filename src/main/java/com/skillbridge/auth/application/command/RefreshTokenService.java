package com.skillbridge.auth.application.command;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.api.dto.request.RefreshTokenRequest;
import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.api.mapper.AuthMapper;
import com.skillbridge.auth.domain.entity.RefreshToken;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.infrastructure.persistence.RefreshTokenRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

// RefreshTokenService: Manages token family rotation, reuse attack detection, and session logout
// Linkage: AuthController -> RefreshTokenService -> (RefreshTokenRepository, UserRepository, UserRoleRepository, JwtTokenService, RefreshTokenIssuer, AuthMapper)
@Service
@Transactional
@RequiredArgsConstructor
public class RefreshTokenService {

    // Repository for querying and updating refresh token hashes
    private final RefreshTokenRepository refreshTokenRepository;

    // Repository for loading active User account
    private final UserRepository userRepository;

    // Repository for retrieving user roles
    private final UserRoleRepository userRoleRepository;

    // Service for hashing the incoming raw refresh token before database lookup
    private final JwtTokenService jwtTokenService;

    // Central component that persists the rotated refresh token inside the existing family
    private final RefreshTokenIssuer refreshTokenIssuer;

    // Mapper to convert User entity and tokens into standardized AuthResponse DTO
    private final AuthMapper authMapper;

    // Rotates the refresh token, validates expiry/reuse, and issues fresh 12h JWT token + new refresh token in same family
    // Linkage: Invoked by AuthController.refresh() when access token expires
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Step 1: Compute SHA-256 hash of submitted opaque refresh token
        String tokenHash = jwtTokenService.hashToken(request.getRefreshToken());

        // Step 2: Query database for matching token record
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AccessDeniedException("Invalid refresh token"));

        // Step 3: Check if the token has expired
        if (storedToken.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new AccessDeniedException("Refresh token has expired");
        }

        // Step 4: Detect token reuse attack (if an already revoked token is used, revoke entire family)
        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            refreshTokenRepository.revokeFamily(storedToken.getFamilyId());
            throw new AccessDeniedException("Revoked token reused. Entire family has been revoked.");
        }

        // Step 5: Mark the current refresh token as revoked (one-time use rotation)
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Step 6: Load user account and ensure it is not disabled
        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new AccessDeniedException("User not found"));

        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new AccessDeniedException("Account has been disabled");
        }

        // Step 7: Load user roles from 'user_roles'
        List<String> roles = userRoleRepository.findByUserId(user.getId())
                .stream()
                .map(UserRole::getRole)
                .toList();

        // Step 8: Issue new 12-hour JWT Access Token
        JwtTokenService.TokenResult tokenResult = jwtTokenService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                roles,
                user.getStatus().name()
        );

        // Step 9: Issue the rotated refresh token inside the SAME family (hashing + persistence delegated to RefreshTokenIssuer)
        String newRawRefreshToken = refreshTokenIssuer.issueRotated(user.getId(), storedToken.getFamilyId());

        // Step 10: Map results to AuthResponse DTO
        return authMapper.toAuthResponse(
                tokenResult.token(),
                tokenResult.expiresAt(),
                newRawRefreshToken,
                user,
                roles
        );
    }

    // Revokes the entire refresh token family associated with the given refresh token, effectively logging out
    // Linkage: Invoked by AuthController.logout() during client logout request
    public void logout(RefreshTokenRequest request) {
        String tokenHash = jwtTokenService.hashToken(request.getRefreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            refreshTokenRepository.revokeFamily(token.getFamilyId());
        });
    }
}
