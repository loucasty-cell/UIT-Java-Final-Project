package com.skillbridge.mentor.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentor_offerings")
@Getter
@Setter
public class MentorOffering {

    @Id
    private UUID id;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @Column(name = "teach_user_skill_id", nullable = false)
    private UUID teachUserSkillId;

    @Column(name = "point_cost", nullable = false)
    private Integer pointCost;

    @Column(name = "points_enabled", nullable = false)
    private Boolean pointsEnabled;

    @Column(name = "skill_swap_enabled", nullable = false)
    private Boolean skillSwapEnabled;

    @Column(name = "volunteer_enabled", nullable = false)
    private Boolean volunteerEnabled;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "availability_text", length = 500)
    private String availabilityText;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
