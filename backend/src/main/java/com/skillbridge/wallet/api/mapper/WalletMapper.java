package com.skillbridge.wallet.api.mapper;

import com.skillbridge.wallet.domain.entity.PointTransaction;
import com.skillbridge.wallet.domain.entity.Wallet;
import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import org.springframework.stereotype.Component;

// WalletMapper: The only class that knows both wallet entity shapes and their API DTO shapes
// Linkage: Used by WalletQueryService and DashboardQueryService to build owner-facing projections
@Component
public class WalletMapper {

    // Projects the persisted balances into the safe owner-facing wallet response
    public WalletResponse toWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .availablePoints(wallet.getAvailablePoints())
                .heldPoints(wallet.getHeldPoints())
                .totalEarned(wallet.getTotalEarned())
                .totalSpent(wallet.getTotalSpent())
                .version(wallet.getVersion())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    // Projects one ledger entry into its API shape; never exposes internal ids beyond the reference
    public PointTransactionResponse toTransactionResponse(PointTransaction transaction) {
        return PointTransactionResponse.builder()
                .id(transaction.getId())
                .eventType(transaction.getEventType().name())
                .availableDelta(transaction.getAvailableDelta())
                .heldDelta(transaction.getHeldDelta())
                .balanceAfterAvailable(transaction.getBalanceAfterAvailable())
                .balanceAfterHeld(transaction.getBalanceAfterHeld())
                .description(transaction.getDescription())
                .referenceType(transaction.getReferenceType())
                .referenceId(transaction.getReferenceId())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
