package com.skillbridge.learningrequest.domain.entity;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.shared.domain.model.SessionMode;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.user.domain.entity.UserSkill;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_requests")
@Getter
@Setter
public class LearningRequest {

    @Id
    private UUID id;

    @Column(name = "learner_id", nullable = false)
    private UUID learnerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", insertable = false, updatable = false)
    private User learner;

    @Column(name = "mentor_id", nullable = false)
    private UUID mentorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", insertable = false, updatable = false)
    private User mentor;

    @Column(name = "mentor_offering_id")
    private UUID mentorOfferingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_offering_id", insertable = false, updatable = false)
    private MentorOffering mentorOffering;

    @Column(name = "requested_skill_id", nullable = false)
    private UUID requestedSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_skill_id", insertable = false, updatable = false)
    private Skill requestedSkill;

    @Column(name = "offered_user_skill_id")
    private UUID offeredUserSkillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offered_user_skill_id", insertable = false, updatable = false)
    private UserSkill offeredUserSkill;

    @Column(name = "source_forum_post_id")
    private UUID sourceForumPostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_forum_post_id", insertable = false, updatable = false)
    private ForumPost sourceForumPost;

    @Column(name = "learning_need_offer_id")
    private UUID learningNeedOfferId;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 20)
    private SessionMode mode;

    @Column(name = "point_cost", nullable = false)
    private Integer pointCost;

    @Column(name = "points_held", nullable = false)
    private Boolean pointsHeld;

    @Column(name = "scheduled_start", nullable = false)
    private OffsetDateTime scheduledStart;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LearningRequestStatus status;

    @Column(name = "session_id")
    private UUID sessionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private SwapSession session;

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
            status = LearningRequestStatus.PENDING;
        }
        if (pointCost == null) {
            pointCost = 0;
        }
        if (pointsHeld == null) {
            pointsHeld = false;
        }
        if (durationMinutes == null) {
            durationMinutes = 60;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
