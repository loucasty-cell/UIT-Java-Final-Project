package com.skillbridge.milestone.infrastructure.persistence;

import com.skillbridge.milestone.domain.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
    Optional<Milestone> findByCode(String code);
}
