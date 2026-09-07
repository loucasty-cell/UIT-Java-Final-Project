package com.skillbridge.learningneed.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_need_offers", uniqueConstraints = @UniqueConstraint(columnNames = { "learning_need_id", "teacher_id" }))
@Getter
@Setter
public class LearningNeedOffer {
    @Id
    private UUID id;

    @Column(name = "learning_need_id", nullable = false)
    private UUID learningNeedId;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    @Column(length = 2000)
    private String message;

    @Column(name = "proposed_start", nullable = false)
    private OffsetDateTime proposedStart;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
