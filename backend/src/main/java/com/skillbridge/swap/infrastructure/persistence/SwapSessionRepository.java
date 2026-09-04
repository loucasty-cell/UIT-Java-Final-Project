package com.skillbridge.swap.infrastructure.persistence;

import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwapSessionRepository extends JpaRepository<SwapSession, UUID> {
    long countByStatusIn(List<SwapSessionStatus> statuses);

    Optional<SwapSession> findBySwapRequestId(UUID swapRequestId);

    List<SwapSession> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId);

    @Query("""
            select session from SwapSession session
            where (session.requesterId = :userId or session.responderId = :userId)
              and session.status in :statuses
            order by session.createdAt desc
            """)
    List<SwapSession> findActiveByUserId(
            @Param("userId") UUID userId,
            @Param("statuses") List<SwapSessionStatus> statuses
    );

    @Query("""
            select session from SwapSession session
            where (session.requesterId = :userId or session.responderId = :userId)
            order by coalesce(session.scheduledAt, session.createdAt) desc
            """)
    List<SwapSession> findAllByUserId(@Param("userId") UUID userId);

    @Query("""
            select session from SwapSession session
            where (session.requesterId = :userId or session.responderId = :userId)
              and session.status = :status
            order by coalesce(session.scheduledAt, session.createdAt) desc
            """)
    List<SwapSession> findByUserIdAndStatus(
            @Param("userId") UUID userId,
            @Param("status") SwapSessionStatus status
    );

    @Query("""
            select session from SwapSession session
            where (session.requesterId = :userId or session.responderId = :userId)
              and session.scheduledAt is not null
              and session.scheduledAt >= :startDate
              and session.scheduledAt <= :endDate
            order by session.scheduledAt asc
            """)
    List<SwapSession> findSessionsInDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    @Query("""
            select session from SwapSession session
            where session.status in :statuses
              and session.autoReleaseAt is not null
              and session.autoReleaseAt <= :now
            """)
    List<SwapSession> findSessionsEligibleForAutoRelease(
            @Param("statuses") List<SwapSessionStatus> statuses,
            @Param("now") OffsetDateTime now
    );

    @Query("""
            SELECT s FROM SwapSession s
            WHERE (s.requesterId = :userId OR s.responderId = :userId)
              AND s.status IN :statuses
              AND s.scheduledAt IS NOT NULL
              AND s.scheduledAt < :bufferEnd
              AND (s.scheduledEnd IS NULL OR s.scheduledEnd > :bufferStart)
            """)
    List<SwapSession> findConflictingSessions(
            @Param("userId") UUID userId,
            @Param("bufferStart") OffsetDateTime bufferStart,
            @Param("bufferEnd") OffsetDateTime bufferEnd,
            @Param("statuses") List<SwapSessionStatus> statuses
    );

    @Query("""
            SELECT COUNT(s) FROM SwapSession s
            WHERE (s.requesterId = :userId OR s.responderId = :userId)
              AND s.status = 'COMPLETED'
            """)
    long countCompletedSessionsByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(s) FROM SwapSession s
            WHERE s.responderId = :userId
              AND s.status = 'COMPLETED'
            """)
    long countTaughtSessionsByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(s) FROM SwapSession s
            WHERE (s.requesterId = :userId OR s.responderId = :userId)
              AND s.status = 'COMPLETED'
              AND s.mode = 'SKILL_SWAP'
            """)
    long countCompletedSwapsByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT COUNT(s) FROM SwapSession s
            WHERE s.responderId = :userId
              AND s.status = 'COMPLETED'
              AND s.mode = 'VOLUNTEER'
            """)
    long countVolunteerSessionsByUserId(@Param("userId") UUID userId);
}
