package com.skillbridge.skill.application;

import com.skillbridge.skill.SkillTestRepositoryFactory;
import com.skillbridge.skill.api.dto.request.CreateSkillRequest;
import com.skillbridge.skill.api.dto.response.SkillResponse;
import com.skillbridge.skill.api.mapper.SkillMapper;
import com.skillbridge.skill.domain.Skill;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class SkillServiceTest {

    @Test
    void returnsAllSkillsAsResponses() {
        Skill java = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "Java", "Programming", "Backend");
        Skill design = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "UX Design", "Design", "Research");
        SkillService service = new SkillService(
                SkillTestRepositoryFactory.repositoryWith(java, design),
                new SkillMapper()
        );

        List<SkillResponse> responses = service.getAllSkills();

        assertEquals(2, responses.size());
        assertEquals("Java", responses.get(0).getName());
        assertEquals("UX Design", responses.get(1).getName());
    }

    @Test
    void returnsSkillById() {
        UUID id = UUID.randomUUID();
        Skill java = SkillTestRepositoryFactory.skill(id, "Java", "Programming", "Backend");
        SkillService service = new SkillService(
                SkillTestRepositoryFactory.repositoryWith(java),
                new SkillMapper()
        );

        SkillResponse response = service.getSkillById(id);

        assertEquals(id, response.getId());
        assertEquals("Java", response.getName());
    }

    @Test
    void createsSkillFromRequest() {
        SkillService service = new SkillService(
                SkillTestRepositoryFactory.repositoryWith(),
                new SkillMapper()
        );
        CreateSkillRequest request = new CreateSkillRequest();
        request.setName("Spring Boot");
        request.setCategory("Programming");
        request.setDescription("REST APIs");

        SkillResponse response = service.createSkill(request);

        assertNotNull(response.getId());
        assertEquals("Spring Boot", response.getName());
        assertEquals("Programming", response.getCategory());
        assertEquals("REST APIs", response.getDescription());
    }

    @Test
    void searchesSkillsByNameIgnoringCase() {
        Skill java = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "Java", "Programming", "Backend");
        Skill javascript = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "JavaScript", "Programming", "Frontend");
        Skill design = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "UX Design", "Design", "Research");
        SkillService service = new SkillService(
                SkillTestRepositoryFactory.repositoryWith(java, javascript, design),
                new SkillMapper()
        );

        List<SkillResponse> responses = service.searchSkills("java");

        assertEquals(2, responses.size());
        assertEquals("Java", responses.get(0).getName());
        assertEquals("JavaScript", responses.get(1).getName());
    }
}
