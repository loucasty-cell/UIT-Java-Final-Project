package com.skillbridge.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "platform_settings")
@Getter
@Setter
public class PlatformSetting {

    @Id
    private UUID id;

    @Column(name = "registration_bonus", nullable = false)
    private Integer registrationBonus;

    @Column(name = "forum_contribution_reward", nullable = false)
    private Integer forumContributionReward;

    @Column(name = "escrow_release_hours", nullable = false)
    private Integer escrowReleaseHours;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
