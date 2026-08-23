package com.skillbridge.swap.infrastructure.persistence;

import com.skillbridge.swap.domain.entity.SwapSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SwapSessionRepository extends JpaRepository<SwapSession, UUID> {

    Optional<SwapSession> findBySwapRequestId(UUID swapRequestId);

    List<SwapSession> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId);
}
