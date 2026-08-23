package com.skillbridge.swap.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.skill.domain.Skill;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "swap_requests")
@Getter
@Setter
public class SwapRequest {

    @Id
    private UUID id;

    @Column(name = "requester_id", nullable = false)
    private UUID requesterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", insertable = false, updatable = false)
    private User requester;

    @Column(name = "responder_id", nullable = false)
    private UUID responderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responder_id", insertable = false, updatable = false)
    private User responder;

    @Column(name = "offered_skill_id", nullable = false)
    private UUID offeredSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offered_skill_id", insertable = false, updatable = false)
    private Skill offeredSkill;

    @Column(name = "requested_skill_id", nullable = false)
    private UUID requestedSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_skill_id", insertable = false, updatable = false)
    private Skill requestedSkill;

    @Column(name = "point_cost", nullable = false)
    private Integer pointCost;

    @Column(name = "points_held", nullable = false)
    private Boolean pointsHeld;

    @Column(name = "message", length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private SwapRequestStatus status;

    @Column(name = "accepted_at")
    private OffsetDateTime acceptedAt;

    @Column(name = "rejected_at")
    private OffsetDateTime rejectedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (status == null) {
            status = SwapRequestStatus.PENDING;
        }
        if (pointCost == null) {
            pointCost = 0;
        }
        if (pointsHeld == null) {
            pointsHeld = false;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
