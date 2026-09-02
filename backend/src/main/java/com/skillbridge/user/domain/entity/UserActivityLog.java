package com.skillbridge.user.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_activity_log")
@Getter
@Setter
public class UserActivityLog {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "login_count", nullable = false)
    private Integer loginCount = 0;

    @Column(name = "sessions_attended", nullable = false)
    private Integer sessionsAttended = 0;

    @Column(name = "hours_learned", nullable = false, precision = 10, scale = 2)
    private BigDecimal hoursLearned = BigDecimal.ZERO;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (loginCount == null) loginCount = 0;
        if (sessionsAttended == null) sessionsAttended = 0;
        if (hoursLearned == null) hoursLearned = BigDecimal.ZERO;
        if (pointsEarned == null) pointsEarned = 0;
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
