package com.skillbridge.review.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter
@Setter
public class Review {

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private SwapSession session;

    @Column(name = "reviewer_id", nullable = false)
    private UUID reviewerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", insertable = false, updatable = false)
    private User reviewer;

    @Column(name = "reviewee_id", nullable = false)
    private UUID revieweeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", insertable = false, updatable = false)
    private User reviewee;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", insertable = false, updatable = false)
    private Skill skill;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "feedback", length = 1000)
    private String feedback;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(name = "moderation_status", nullable = false, length = 20)
    private ReviewModerationStatus moderationStatus;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (version == null) {
            version = 0L;
        }
        if (moderationStatus == null) {
            moderationStatus = ReviewModerationStatus.VERIFIED;
        }
        createdAt = OffsetDateTime.now();
    }
}
