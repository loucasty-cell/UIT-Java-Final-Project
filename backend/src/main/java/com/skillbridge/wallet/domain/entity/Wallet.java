package com.skillbridge.wallet.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
public class Wallet {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    // Freely spendable points; never negative (enforced by DB check constraint)
    @Column(name = "available_points", nullable = false)
    private Integer availablePoints;

    // Points locked in escrow for in-flight learning requests; never negative
    @Column(name = "held_points", nullable = false)
    private Integer heldPoints;

    // Lifetime sum of all positive available deltas (bonuses, rewards, releases)
    @Column(name = "total_earned", nullable = false)
    private Integer totalEarned;

    // Lifetime sum of all spent points (holds that ended in release to a mentor)
    @Column(name = "total_spent", nullable = false)
    private Integer totalSpent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
