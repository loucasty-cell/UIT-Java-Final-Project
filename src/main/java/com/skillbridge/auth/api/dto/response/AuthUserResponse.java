package com.skillbridge.auth.api.dto.response;

import com.skillbridge.admin.domain.model.AccountStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

// AuthUserResponse: Safe public profile summary of the authenticated user returned inside AuthResponse
// Linkage: Built by AuthMapper.toAuthUserResponse() -> Serialized into every register/login/refresh response
// Security note: Deliberately excludes passwordHash and internal audit fields (version, updatedAt)
@Data
@Builder
public class AuthUserResponse {

    // Globally unique identifier of the user (primary key of 'users' table)
    private UUID id;

    // Login email address used for authentication
    private String email;

    // Given name shown on the user's profile
    private String firstName;

    // Family name shown on the user's profile
    private String lastName;

    // Convenience field: "firstName lastName" used directly by the frontend UI
    private String displayName;

    // Granted authorities (e.g. ["USER"]) embedded in the JWT and used for @PreAuthorize checks
    private List<String> roles;

    // Current lifecycle state of the account (ACTIVE, DISABLED, ...)
    private AccountStatus accountStatus;
}
