package com.skillbridge.auth.application.command;

import com.skillbridge.admin.domain.entity.PlatformSetting;
import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.auth.api.dto.request.RegisterRequest;
import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.api.mapper.AuthMapper;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.domain.model.Role;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

// RegistrationService: Transactional application service managing user registration and initial onboarding
// Linkage: AuthController -> RegistrationService -> (UserRepository, UserRoleRepository, RefreshTokenIssuer, JwtTokenService, AuthMapper)
@Service
@Transactional
@RequiredArgsConstructor
public class RegistrationService {

    // Repository for persisted User entities in PostgreSQL 'users' table
    private final UserRepository userRepository;

    // Repository for user-role relationships in 'user_roles' table
    private final UserRoleRepository userRoleRepository;

    // The only financial mutation boundary; creates the starter wallet and grants the bonus
    private final WalletService walletService;

    // Read access to the seeded platform_settings row owning the registration bonus amount
    private final PlatformSettingRepository platformSettingRepository;

    // Password encoder (BCrypt) for secure one-way password hashing
    private final PasswordEncoder passwordEncoder;

    // Service for generating 12-hour signed JWT access tokens
    private final JwtTokenService jwtTokenService;

    // Central component that generates, hashes, and persists the initial refresh token family
    private final RefreshTokenIssuer refreshTokenIssuer;

    // Mapper to convert User entity and tokens into standardized AuthResponse DTO
    private final AuthMapper authMapper;

    // Executes atomic registration: creates user record, assigns USER role, generates 12h JWT and refresh token family
    // Linkage: Invoked by AuthController.register() during client registration request
    public AuthResponse register(RegisterRequest request) {
        // Step 1: Validate email uniqueness constraint before persisting
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists: " + request.getEmail());
        }

        // Step 2: Initialize new User domain entity with UUID key and BCrypt password hash
        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setStatus(AccountStatus.ACTIVE);
        user.setCreatedAt(OffsetDateTime.now());
        user.setUpdatedAt(OffsetDateTime.now());

        // Step 3: Persist User in PostgreSQL database
        User savedUser = userRepository.save(user);

        // Step 4: Assign default 'USER' authority to the newly registered account
        UserRole userRole = new UserRole(userId, Role.USER.name());
        userRoleRepository.save(userRole);

        // Step 4b: Create the starter wallet and grant the one-time registration bonus atomically;
        // the idempotency key "REG:" + userId guarantees exactly one award even on retries
        walletService.createWalletForRegistration(userId);
        int registrationBonus = loadRegistrationBonus();
        if (registrationBonus > 0) {
            walletService.awardOnce(
                    userId,
                    PointEventType.REGISTRATION_BONUS,
                    registrationBonus,
                    "Registration bonus",
                    "REGISTRATION",
                    userId,
                    "REG:" + userId
            );
        }

        List<String> roles = Collections.singletonList(Role.USER.name());

        // Step 5: Issue signed HMAC-SHA256 JWT access token with 12-hour (720 min) lifespan
        JwtTokenService.TokenResult tokenResult = jwtTokenService.generateAccessToken(
                savedUser.getId(),
                savedUser.getEmail(),
                roles,
                savedUser.getStatus().name()
        );

        // Step 6: Issue the initial refresh token family (generation + hashing + persistence handled by RefreshTokenIssuer)
        String rawRefreshToken = refreshTokenIssuer.issueNewFamily(userId);

        // Step 7: Map entity state and generated tokens to AuthResponse DTO
        return authMapper.toAuthResponse(
                tokenResult.token(),
                tokenResult.expiresAt(),
                rawRefreshToken,
                savedUser,
                roles
        );
    }

    // Reads the server-owned registration bonus from platform settings; falls back to 50 when absent
    private int loadRegistrationBonus() {
        return platformSettingRepository.findTopByOrderByUpdatedAtDesc()
                .map(PlatformSetting::getRegistrationBonus)
                .orElse(50);
    }
}
