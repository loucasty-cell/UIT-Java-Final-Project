package com.skillbridge.auth.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// LoginRequest: Incoming payload for POST /api/v1/auth/login
// Linkage: Deserialized by AuthController.login() -> Validated by @Valid -> Consumed by AuthenticationService
// Note: No complexity rules here - login only checks the fields are present and well-formed,
// real credential verification happens against the stored BCrypt hash in AuthenticationService
@Data
public class LoginRequest {

    // Email of the account attempting to authenticate
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    // Plaintext password; compared against the BCrypt hash, never logged or persisted
    @NotBlank(message = "Password is required")
    private String password;
}
