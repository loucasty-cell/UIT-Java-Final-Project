package com.skillbridge.skill.api.mapper;

import com.skillbridge.skill.api.dto.response.SkillResponse;
import com.skillbridge.skill.domain.Skill;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class SkillMapperTest {

    private final SkillMapper mapper = new SkillMapper();

    @Test
    void mapsSkillEntityToResponse() {
        UUID id = UUID.randomUUID();
        Skill skill = Skill.builder()
                .id(id)
                .name("Java")
                .category("Programming")
                .description("Backend development")
                .build();

        SkillResponse response = mapper.toResponse(skill);

        assertEquals(id, response.getId());
        assertEquals("Java", response.getName());
        assertEquals("Programming", response.getCategory());
        assertEquals("Backend development", response.getDescription());
    }

    @Test
    void mapsNullToNull() {
        assertNull(mapper.toResponse(null));
    }
}
