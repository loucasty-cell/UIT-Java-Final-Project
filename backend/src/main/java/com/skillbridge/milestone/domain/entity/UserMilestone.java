package com.skillbridge.milestone.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_milestones")
@Getter
@Setter
public class UserMilestone {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "milestone_id", nullable = false)
    private UUID milestoneId;

    @Column(name = "achieved_at", nullable = false)
    private OffsetDateTime achievedAt;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded;
}
