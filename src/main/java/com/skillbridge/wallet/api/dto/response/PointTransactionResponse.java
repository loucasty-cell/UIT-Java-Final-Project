package com.skillbridge.wallet.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

// PointTransactionResponse: One immutable point_ledger entry as seen by its owner
// Linkage: Built by WalletMapper; listed by WalletQueryService for /me/wallet/transactions and CSV export
@Getter
@Builder
@AllArgsConstructor
public class PointTransactionResponse {

    private final UUID id;

    // Event vocabulary, e.g. REGISTRATION_BONUS, POINTS_HOLD, ADMIN_ADJUSTMENT
    private final String eventType;

    // Signed change applied to the available balance in this event
    private final Integer availableDelta;

    // Signed change applied to the held balance in this event
    private final Integer heldDelta;

    // Available balance immediately after this event
    private final Integer balanceAfterAvailable;

    // Held balance immediately after this event
    private final Integer balanceAfterHeld;

    // Server-generated safe description; never client-supplied
    private final String description;

    // Optional owning domain object reference, e.g. LEARNING_REQUEST
    private final String referenceType;

    private final UUID referenceId;

    private final OffsetDateTime createdAt;
}
