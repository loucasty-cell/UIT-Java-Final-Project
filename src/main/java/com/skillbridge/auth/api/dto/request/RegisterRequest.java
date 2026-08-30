package com.skillbridge.auth.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

// RegisterRequest: Incoming payload for POST /api/v1/auth/register
// Linkage: Deserialized by AuthController.register() -> Validated by @Valid -> Consumed by RegistrationService
// Validation runs BEFORE any business logic, so invalid payloads never reach the database layer
@Data
public class RegisterRequest {

    // Login identifier; must be a syntactically valid email and fits the DB column (varchar 255)
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    // Password policy: 8-100 chars AND must contain at least one letter and one digit
    // The regex uses lookahead (?=...) so the whole string is checked without consuming characters
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Password must contain at least one letter and one digit"
    )
    private String password;

    // Profile fields persisted on the 'users' table (both max 100 chars, matching column size)
    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    // Optional student metadata - kept for future profile enrichment, not required at registration
    private String displayName;
    private String major;
    private Integer yearOfStudy;
    private String referralCode;
}
