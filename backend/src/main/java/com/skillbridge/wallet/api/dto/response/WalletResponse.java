package com.skillbridge.wallet.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;

// WalletResponse: Owner-facing wallet projection with server-owned balances only
// Linkage: Built by WalletMapper from the Wallet entity; exposed by WalletController and DashboardController
@Getter
@Builder
@AllArgsConstructor
public class WalletResponse {

    // Freely spendable points
    private final Integer availablePoints;

    // Points locked in escrow for in-flight learning requests
    private final Integer heldPoints;

    // Lifetime points received
    private final Integer totalEarned;

    // Lifetime points spent via released escrows
    private final Integer totalSpent;

    // Optimistic-lock version surfaced to API clients per contract
    private final Long version;

    private final OffsetDateTime updatedAt;
}
