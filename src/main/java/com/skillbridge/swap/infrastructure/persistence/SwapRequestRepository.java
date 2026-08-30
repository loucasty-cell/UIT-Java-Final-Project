package com.skillbridge.swap.infrastructure.persistence;

import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SwapRequestRepository extends JpaRepository<SwapRequest, UUID> {

    List<SwapRequest> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId);

    List<SwapRequest> findByStatusAndCreatedAtBefore(SwapRequestStatus status, OffsetDateTime before);
}
