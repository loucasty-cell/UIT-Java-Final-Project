package com.skillbridge.session.infrastructure.persistence;

import com.skillbridge.session.domain.entity.SessionConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionConfirmationRepository extends JpaRepository<SessionConfirmation, UUID> {

    List<SessionConfirmation> findBySessionId(UUID sessionId);

    Optional<SessionConfirmation> findBySessionIdAndConfirmedBy(UUID sessionId, UUID confirmedBy);

    boolean existsBySessionIdAndConfirmedBy(UUID sessionId, UUID confirmedBy);

    long countBySessionId(UUID sessionId);
}

