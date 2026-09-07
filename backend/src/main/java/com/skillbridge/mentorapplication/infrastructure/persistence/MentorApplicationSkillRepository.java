package com.skillbridge.mentorapplication.infrastructure.persistence;

import com.skillbridge.mentorapplication.domain.entity.MentorApplicationSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorApplicationSkillRepository extends JpaRepository<MentorApplicationSkill, MentorApplicationSkill.MentorApplicationSkillId> {

    List<MentorApplicationSkill> findByApplicationId(UUID applicationId);

    void deleteByApplicationId(UUID applicationId);
}
