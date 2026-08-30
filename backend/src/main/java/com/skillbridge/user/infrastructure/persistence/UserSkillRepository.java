package com.skillbridge.user.infrastructure.persistence;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.user.domain.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, UUID> {

    List<UserSkill> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<UserSkill> findByUserIdAndDirectionOrderByCreatedAtDesc(UUID userId, Direction direction);

    Optional<UserSkill> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndSkillIdAndDirection(UUID userId, UUID skillId, Direction direction);
}

