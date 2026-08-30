package com.skillbridge.wallet.infrastructure.persistence;

import com.skillbridge.wallet.domain.entity.Escrow;
import com.skillbridge.wallet.domain.model.EscrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EscrowRepository extends JpaRepository<Escrow, UUID> {

    List<Escrow> findByReferenceId(UUID referenceId);

    Optional<Escrow> findByReferenceTypeAndReferenceIdAndStatus(String referenceType, UUID referenceId, EscrowStatus status);

    List<Escrow> findByLearnerIdAndStatus(UUID learnerId, EscrowStatus status);
}
