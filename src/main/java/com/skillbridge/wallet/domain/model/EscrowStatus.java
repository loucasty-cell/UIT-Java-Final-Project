package com.skillbridge.wallet.domain.model;

// EscrowStatus: Lifecycle of an escrowed point hold between a learner and a mentor
// Linkage: Created by WalletService.holdPoints(); closed exactly once by releaseHeldPoints or refundHeldPoints
public enum EscrowStatus {

    // Points locked in the learner wallet's held balance, waiting for session completion
    HELD,

    // Held points released to the mentor after completion or auto-release deadline
    RELEASED,

    // Held points returned to the learner available balance
    REFUNDED,

    // Hold cancelled without any transfer
    CANCELLED
}
