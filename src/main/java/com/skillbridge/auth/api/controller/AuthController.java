package com.skillbridge.auth.api.controller;

import com.skillbridge.auth.api.dto.request.LoginRequest;
import com.skillbridge.auth.api.dto.request.RefreshTokenRequest;
import com.skillbridge.auth.api.dto.request.RegisterRequest;
import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.application.command.AuthenticationService;
import com.skillbridge.auth.application.command.RefreshTokenService;
import com.skillbridge.auth.application.command.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// AuthController: Exposes public REST endpoints for user registration, authentication, token refresh, and logout
// Linkage: Receives HTTP requests -> Validates DTOs -> Delegates to Application Command Services (RegistrationService, AuthenticationService, RefreshTokenService)
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    // Service dependency for new user registration and initial token generation
    private final RegistrationService registrationService;

    // Service dependency for credential verification and login token issuance
    private final AuthenticationService authenticationService;

    // Service dependency for refresh token rotation, reuse detection, and session termination
    private final RefreshTokenService refreshTokenService;

    // Registers a new user account with default role USER and generates 12-hour access token + refresh token
    // Linkage: POST /api/v1/auth/register -> RegistrationService.register() -> UserRepository, UserRoleRepository, RefreshTokenRepository
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Delegate user creation to registration application service
        AuthResponse response = registrationService.register(request);
        // Return 201 Created status code with authentication payload
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Authenticates user credentials and returns a new 12-hour JWT access token and refresh token family
    // Linkage: POST /api/v1/auth/login -> AuthenticationService.login() -> UserRepository, PasswordEncoder, JwtTokenService
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Delegate credential verification and token creation to authentication service
        AuthResponse response = authenticationService.login(request);
        // Return 200 OK status code with new tokens and safe profile summary
        return ResponseEntity.ok(response);
    }

    // Rotates the refresh token and issues a fresh 12-hour JWT access token within the active token family
    // Linkage: POST /api/v1/auth/refresh -> RefreshTokenService.refreshToken() -> RefreshTokenRepository, JwtTokenService
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        // Delegate token verification and rotation to refresh token service
        AuthResponse response = refreshTokenService.refreshToken(request);
        // Return 200 OK status code with refreshed access token and rotated refresh token
        return ResponseEntity.ok(response);
    }

    // Revokes the current refresh token family to terminate user session across the platform
    // Linkage: POST /api/v1/auth/logout -> RefreshTokenService.logout() -> RefreshTokenRepository.revokeFamily()
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        // Delegate family revocation to refresh token service
        refreshTokenService.logout(request);
        // Return 204 No Content indicating successful logout
        return ResponseEntity.noContent().build();
    }
}
