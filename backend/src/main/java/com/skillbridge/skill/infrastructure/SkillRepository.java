package com.skillbridge.skill.infrastructure;

import com.skillbridge.skill.domain.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findByCategory(String category);

    List<Skill> findByNameContainingIgnoreCase(String name);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s.category FROM Skill s WHERE s.category IS NOT NULL ORDER BY s.category ASC")
    List<String> findDistinctCategories();
}
