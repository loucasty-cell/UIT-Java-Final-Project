package com.skillbridge.learningneed.infrastructure.persistence;

import com.skillbridge.learningneed.domain.entity.LearningNeedOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LearningNeedOfferRepository extends JpaRepository<LearningNeedOffer, UUID> {
    boolean existsByLearningNeedIdAndTeacherId(UUID learningNeedId, UUID teacherId);
    long countByLearningNeedId(UUID learningNeedId);
}
