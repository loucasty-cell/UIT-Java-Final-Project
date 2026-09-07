package com.skillbridge.milestone.infrastructure.persistence;

import com.skillbridge.milestone.domain.entity.UserMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserMilestoneRepository extends JpaRepository<UserMilestone, UUID> {
    List<UserMilestone> findByUserId(UUID userId);
    Optional<UserMilestone> findByUserIdAndMilestoneId(UUID userId, UUID milestoneId);
    boolean existsByUserIdAndMilestoneId(UUID userId, UUID milestoneId);
}
