package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.dto.response.AdminUserResponse;
import com.skillbridge.admin.application.command.AdminAuditService;
import com.skillbridge.admin.application.command.AdminUserService;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.wallet.api.dto.request.WalletAdjustmentRequest;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.application.query.WalletQueryService;
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

    // The only financial mutation boundary; applies the signed adjustment to the target wallet
    private final WalletService walletService;

    // Read-only wallet projections used to echo the updated balances back to the admin client
    private final WalletQueryService walletQueryService;

    // Audit service recording every wallet adjustment for the admin audit trail
    private final AdminAuditService adminAuditService;

    // Applies a signed point adjustment to a user's wallet with a mandatory audit reason
    // Linkage: POST /api/v1/admin/users/{userId}/wallet-adjustments -> WalletService.adjust() -> AdminAuditService
    @PostMapping("/{userId}/wallet-adjustments")
    public ResponseEntity<WalletResponse> adjustWallet(
            @PathVariable UUID userId,
            @Valid @RequestBody WalletAdjustmentRequest request
    ) {
        // Step 1: Guard against a path/body target mismatch before touching balances
        if (!userId.equals(request.getTargetUserId())) {
            throw new IllegalArgumentException("Target user id must match the path variable");
        }

        // Step 2: Apply the signed delta; the command appends the immutable ledger entry atomically
        walletService.adjust(userId, request.getDelta(), request.getReason());

        // Step 3: Record who changed what for the admin audit trail
        String summary = (request.getDelta() > 0 ? "+" : "") + request.getDelta() + " points";
        adminAuditService.logEvent(
                SecurityUtils.getCurrentUserId(),
                "WALLET_ADJUSTMENT",
                "USER",
                userId,
                null,
                summary,
                request.getReason(),
                null
        );

        // Step 4: Echo the fresh wallet state from the read-only projection
        return ResponseEntity.ok(walletQueryService.getWallet(userId));
    }

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
