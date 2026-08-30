package com.skillbridge.user.api.mapper;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.user.api.dto.response.UserSkillResponse;
import com.skillbridge.user.domain.entity.UserSkill;
import org.springframework.stereotype.Component;

@Component
public class UserSkillMapper {

    public UserSkillResponse toResponse(UserSkill userSkill, Skill skill) {
        if (userSkill == null) {
            return null;
        }

        SkillSummaryResponse skillSummary = null;
        if (skill != null) {
            skillSummary = new SkillSummaryResponse();
            skillSummary.setId(skill.getId());
            skillSummary.setName(skill.getName());
            skillSummary.setSlug(skill.getName().toLowerCase().replace(" ", "-"));
        }

        return UserSkillResponse.builder()
                .id(userSkill.getId())
                .skill(skillSummary)
                .direction(userSkill.getDirection())
                .level(userSkill.getLevel())
                .createdAt(userSkill.getCreatedAt())
                .updatedAt(userSkill.getUpdatedAt())
                .version(userSkill.getVersion())
                .build();
    }
}

