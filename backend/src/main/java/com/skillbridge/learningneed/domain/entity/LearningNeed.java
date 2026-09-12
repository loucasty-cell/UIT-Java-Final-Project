package com.skillbridge.learningneed.domain.entity;

import com.skillbridge.mentor.domain.entity.MentorAvailabilitySlot;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "learning_needs")
@Getter
@Setter
public class LearningNeed {
    @Id
    private UUID id;

    @Column(name = "learner_id", nullable = false)
    private UUID learnerId;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(name = "availability_text", length = 500)
    private String availabilityText;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "learning_need_availability", joinColumns = @JoinColumn(name = "learning_need_id"))
    private Set<MentorAvailabilitySlot> availabilitySlots = new LinkedHashSet<>();

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "allowed_modes", nullable = false, length = 100)
    private String allowedModes;

    @Column(name = "exchange_user_skill_id")
    private UUID exchangeUserSkillId;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(nullable = false)
    private Long version;
}
