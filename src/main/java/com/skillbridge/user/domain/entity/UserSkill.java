package com.skillbridge.user.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import com.skillbridge.skill.domain.entity.Skill;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_skills")
@Getter
@Setter
public class UserSkill {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", insertable = false, updatable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 50)
    private Direction direction;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false, length = 50)
    private Level level;

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
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}

