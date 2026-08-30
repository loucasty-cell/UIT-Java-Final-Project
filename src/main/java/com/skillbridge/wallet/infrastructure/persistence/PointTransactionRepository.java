package com.skillbridge.wallet.infrastructure.persistence;

import com.skillbridge.wallet.domain.entity.PointTransaction;
import com.skillbridge.wallet.domain.model.PointEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, UUID> {

    Optional<PointTransaction> findByIdempotencyKey(String idempotencyKey);

    Page<PointTransaction> findByUserId(UUID userId, Pageable pageable);

    Page<PointTransaction> findByUserIdAndEventType(UUID userId, PointEventType eventType, Pageable pageable);

    Page<PointTransaction> findByUserIdAndCreatedAtBetween(
            UUID userId, OffsetDateTime from, OffsetDateTime to, Pageable pageable);

    Page<PointTransaction> findByUserIdAndEventTypeAndCreatedAtBetween(
            UUID userId, PointEventType eventType, OffsetDateTime from, OffsetDateTime to, Pageable pageable);
}
