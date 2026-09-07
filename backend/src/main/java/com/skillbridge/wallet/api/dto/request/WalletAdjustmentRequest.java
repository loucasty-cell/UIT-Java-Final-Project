package com.skillbridge.wallet.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

// WalletAdjustmentRequest: Admin input for a manual signed point adjustment
// Linkage: AdminUserController -> WalletService.adjust(); balances themselves are never client-supplied
@Getter
@Setter
public class WalletAdjustmentRequest {

    // Target account receiving the adjustment
    @NotNull(message = "Target user id is required")
    private UUID targetUserId;

    // Signed delta; must be non-zero (enforced again in the command service)
    @NotNull(message = "Adjustment delta is required")
    @Min(value = -10000, message = "Adjustment delta must not go below -10000")
    @Max(value = 10000, message = "Adjustment delta must not exceed 10000")
    private Integer delta;

    // Mandatory audit reason stored verbatim on the ledger entry
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;
}
