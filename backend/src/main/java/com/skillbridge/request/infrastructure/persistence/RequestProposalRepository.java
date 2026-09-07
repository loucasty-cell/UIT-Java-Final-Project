package com.skillbridge.request.infrastructure.persistence;

import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RequestProposalRepository extends JpaRepository<SwapRequest, UUID> {

    List<SwapRequest> findByRequesterIdOrResponderIdOrderByCreatedAtDesc(UUID requesterId, UUID responderId);

    List<SwapRequest> findByResponderIdAndStatusOrderByCreatedAtDesc(UUID responderId, SwapRequestStatus status);
}
