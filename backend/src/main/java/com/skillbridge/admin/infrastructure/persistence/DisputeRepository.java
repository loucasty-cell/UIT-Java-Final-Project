package com.skillbridge.admin.infrastructure.persistence;

import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);
    Optional<Dispute> findBySessionId(UUID sessionId);
    long countByStatus(DisputeStatus status);
}
