package com.skillbridge.skill.api.controller;

import com.skillbridge.skill.SkillTestRepositoryFactory;
import com.skillbridge.skill.api.dto.request.CreateSkillRequest;
import com.skillbridge.skill.api.dto.response.SkillResponse;
import com.skillbridge.skill.api.mapper.SkillMapper;
import com.skillbridge.skill.application.SkillService;
import com.skillbridge.skill.domain.Skill;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SkillControllerTest {

    @Test
    void getsAllSkills() {
        Skill java = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "Java", "Programming", "Backend");
        SkillController controller = controllerWith(java);

        ResponseEntity<List<SkillResponse>> response = controller.getAllSkills();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Java", response.getBody().get(0).getName());
    }

    @Test
    void getsSingleSkillById() {
        UUID id = UUID.randomUUID();
        Skill java = SkillTestRepositoryFactory.skill(id, "Java", "Programming", "Backend");
        SkillController controller = controllerWith(java);

        ResponseEntity<SkillResponse> response = controller.getSkillById(id);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(id, response.getBody().getId());
    }

    @Test
    void createsSkill() {
        SkillController controller = controllerWith();
        CreateSkillRequest request = new CreateSkillRequest();
        request.setName("Spring Boot");
        request.setCategory("Programming");
        request.setDescription("REST APIs");

        ResponseEntity<SkillResponse> response = controller.createSkill(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Spring Boot", response.getBody().getName());
    }

    @Test
    void searchesSkills() {
        Skill java = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "Java", "Programming", "Backend");
        Skill design = SkillTestRepositoryFactory.skill(UUID.randomUUID(), "UX Design", "Design", "Research");
        SkillController controller = controllerWith(java, design);

        ResponseEntity<List<SkillResponse>> response = controller.searchSkills("java");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Java", response.getBody().get(0).getName());
    }

    private SkillController controllerWith(Skill... skills) {
        SkillService service = new SkillService(
                SkillTestRepositoryFactory.repositoryWith(skills),
                new SkillMapper()
        );
        return new SkillController(service);
    }
}
