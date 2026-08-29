package com.skillbridge.learningrequest.infrastructure.persistence;

import com.skillbridge.learningrequest.domain.entity.LearningRequest;
import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningRequestRepository extends JpaRepository<LearningRequest, UUID> {

    List<LearningRequest> findByLearnerIdOrderByCreatedAtDesc(UUID learnerId);

    List<LearningRequest> findByLearnerIdAndStatusOrderByCreatedAtDesc(UUID learnerId, LearningRequestStatus status);

    List<LearningRequest> findByMentorIdOrderByCreatedAtDesc(UUID mentorId);

    List<LearningRequest> findByMentorIdAndStatusOrderByCreatedAtDesc(UUID mentorId, LearningRequestStatus status);

    @Query("""
        SELECT lr FROM LearningRequest lr
        WHERE (lr.learnerId = :userId OR lr.mentorId = :userId)
          AND lr.status = 'PENDING'
          AND lr.scheduledStart < :bufferEnd
          AND lr.scheduledStart >= :bufferStart
    """)
    List<LearningRequest> findPendingConflicts(
            @Param("userId") UUID userId,
            @Param("bufferStart") OffsetDateTime bufferStart,
            @Param("bufferEnd") OffsetDateTime bufferEnd
    );

    @Query("SELECT lr FROM LearningRequest lr WHERE lr.status = 'PENDING' AND lr.createdAt < :cutoff")
    List<LearningRequest> findExpiredPendingRequests(@Param("cutoff") OffsetDateTime cutoff);
}
