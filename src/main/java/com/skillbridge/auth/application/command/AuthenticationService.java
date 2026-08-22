package com.skillbridge.auth.application.command;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.api.dto.request.LoginRequest;
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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// AuthenticationService: Manages user login verification, account status checks, and token generation
// Linkage: AuthController -> AuthenticationService -> (UserRepository, PasswordEncoder, UserRoleRepository, JwtTokenService, RefreshTokenRepository, AuthMapper)
@Service
@Transactional
@RequiredArgsConstructor
public class AuthenticationService {

    // Repository for querying User entity by email address
    private final UserRepository userRepository;

    // Repository for querying roles assigned to the user
    private final UserRoleRepository userRoleRepository;

    // Repository for saving newly issued refresh token records
    private final RefreshTokenRepository refreshTokenRepository;

    // BCrypt password matcher for checking submitted plaintext against stored hash
    private final PasswordEncoder passwordEncoder;

    // Service for generating 12-hour signed JWT access tokens and opaque refresh token hashes
    private final JwtTokenService jwtTokenService;

    // Mapper to convert User entity and tokens into standardized AuthResponse DTO
    private final AuthMapper authMapper;

    // Verifies credentials, validates account status, and issues fresh 12h access token + new refresh token family
    // Linkage: Invoked by AuthController.login() when processing user login request
    public AuthResponse login(LoginRequest request) {
        // Step 1: Look up user by email; reject with standard bad credentials if not found
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Step 2: Verify submitted password matches stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Step 3: Enforce account status invariant (DISABLED accounts are strictly blocked)
        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new AccessDeniedException("Account has been disabled. Please contact support.");
        }

        // Step 4: Retrieve all persisted roles for this user from 'user_roles' table
        List<String> roles = userRoleRepository.findByUserId(user.getId())
                .stream()
                .map(UserRole::getRole)
                .toList();

        // Step 5: Generate 12-hour (720 min) HMAC-SHA256 signed JWT access token with user claims
        JwtTokenService.TokenResult tokenResult = jwtTokenService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                roles,
                user.getStatus().name()
        );

        // Step 6: Create new refresh token with fresh family ID for this login session
        String rawRefreshToken = jwtTokenService.generateOpaqueToken();
        String tokenHash = jwtTokenService.hashToken(rawRefreshToken);
        UUID familyId = UUID.randomUUID();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID());
        refreshToken.setUserId(user.getId());
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setFamilyId(familyId);
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(jwtTokenService.getRefreshTokenDays()));
        refreshToken.setCreatedAt(OffsetDateTime.now());
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        // Step 7: Assemble and return AuthResponse containing tokens and user metadata
        return authMapper.toAuthResponse(
                tokenResult.token(),
                tokenResult.expiresAt(),
                rawRefreshToken,
                user,
                roles
        );
    }
}
