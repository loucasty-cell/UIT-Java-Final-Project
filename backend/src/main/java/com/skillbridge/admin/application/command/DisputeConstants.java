package com.skillbridge.admin.application.command;

/**
 * DisputeConstants: Constants for dispute resolution operations
 * Linkage: Used by AdminDisputeService for idempotency keys and reference types
 */
public final class DisputeConstants {
    private DisputeConstants() {
    }

    // Idempotency key prefixes for financial operations
    public static final String IDEMPOTENCY_PREFIX_RELEASE = "DISPUTE_RELEASE:";
    public static final String IDEMPOTENCY_PREFIX_REFUND = "DISPUTE_REFUND:";

    // Reference type for wallet operations
    public static final String REFERENCE_TYPE_SWAP_REQUEST = "SWAP_REQUEST";
}
