package com.skillbridge.skill.api.mapper;

import com.skillbridge.skill.api.dto.response.SkillResponse;
import com.skillbridge.skill.domain.entity.Skill;
import org.springframework.stereotype.Component;

@Component
public class SkillMapper {

    public SkillResponse toResponse(Skill entity) {
        if (entity == null) {
            return null;
        }

        SkillResponse response = new SkillResponse();
        response.setId(entity.getId());
        response.setName(entity.getName());
        response.setCategory(entity.getCategory());
        response.setDescription(entity.getDescription());

        return response;
    }
}
