package com.skillbridge.swap.infrastructure.persistence;

import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwapSessionRepository extends JpaRepository<SwapSession, UUID> {

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
}
