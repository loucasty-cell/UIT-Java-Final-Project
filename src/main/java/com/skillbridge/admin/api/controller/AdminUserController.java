package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.dto.response.AdminUserResponse;
import com.skillbridge.admin.application.command.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// AdminUserController: REST controller managing administrative user status transitions and account warnings
// Linkage: Admin UI Reported Users -> AdminUserController -> AdminUserService -> AccountWarningRepository & AdminAuditService
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    // Command service dependency for warning creation and account status mutations
    private final AdminUserService adminUserService;

    // Issues an official account warning to a user for policy violations (VIOLENT_CONTENT, FRAUDULENT_ACTIVITY, SPAM)
    // Linkage: POST /api/v1/admin/users/{userId}/warnings -> AdminUserService.issueWarning() -> AccountWarningRepository & AdminAuditService
    @PostMapping("/{userId}/warnings")
    public ResponseEntity<AccountWarningResponse> issueWarning(
            @PathVariable UUID userId,
            @Valid @RequestBody AccountWarningRequest request
    ) {
        AccountWarningResponse response = adminUserService.issueWarning(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Updates a user's account status (ACTIVE, WARNED, SUSPENDED, DISABLED) with optimistic concurrency If-Match check
    // Linkage: PATCH /api/v1/admin/users/{userId}/status -> AdminUserService.updateUserStatus() -> AdminAuditService
    @PatchMapping("/{userId}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable UUID userId,
            @Valid @RequestBody AccountStatusUpdateRequest request,
            @RequestHeader(value = "If-Match", required = false) String ifMatch
    ) {
        Long version = null;
        if (ifMatch != null && !ifMatch.isBlank()) {
            try {
                String cleanVersion = ifMatch.replace("\"", "").trim();
                version = Long.parseLong(cleanVersion);
            } catch (NumberFormatException ignored) {
            }
        }

        AdminUserResponse response = adminUserService.updateUserStatus(userId, request, version);
        return ResponseEntity.ok(response);
    }
}
