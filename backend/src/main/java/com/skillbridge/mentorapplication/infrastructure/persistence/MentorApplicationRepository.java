package com.skillbridge.mentorapplication.infrastructure.persistence;

import com.skillbridge.mentorapplication.domain.entity.MentorApplication;
import com.skillbridge.mentorapplication.domain.model.MentorApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorApplicationRepository extends JpaRepository<MentorApplication, UUID> {

    List<MentorApplication> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<MentorApplication> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    List<MentorApplication> findByStatusOrderByCreatedAtDesc(MentorApplicationStatus status);

    boolean existsByUserIdAndStatus(UUID userId, MentorApplicationStatus status);
}
