package com.skillbridge.wallet.domain.entity;

import com.skillbridge.wallet.domain.model.PointEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "point_ledger")
@Getter
@Setter
public class PointTransaction {

    @Id
    private UUID id;

    @Column(name = "wallet_id", nullable = false)
    private UUID walletId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private PointEventType eventType;

    // Signed change applied to the wallet available balance in this event
    @Column(name = "available_delta", nullable = false)
    private Integer availableDelta;

    // Signed change applied to the wallet held balance in this event
    @Column(name = "held_delta", nullable = false)
    private Integer heldDelta;

    // Snapshot of the available balance immediately after this event (audit trail)
    @Column(name = "balance_after_available", nullable = false)
    private Integer balanceAfterAvailable;

    @Column(name = "balance_after_held", nullable = false)
    private Integer balanceAfterHeld;

    // Human-readable, server-generated description; clients never send it
    @Column(name = "description")
    private String description;

    // Optional link to the owning domain object, e.g. LEARNING_REQUEST or FORUM_COMMENT
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    // Unique retry key; a repeated key is silently ignored so commands are idempotent
    @Column(name = "idempotency_key", unique = true, length = 200)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
