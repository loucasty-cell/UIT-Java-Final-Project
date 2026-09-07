package com.skillbridge.learningneed.infrastructure.persistence;

import com.skillbridge.learningneed.domain.entity.LearningNeed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LearningNeedRepository extends JpaRepository<LearningNeed, UUID> {
    List<LearningNeed> findByActiveTrueOrderByCreatedAtDesc();
}
