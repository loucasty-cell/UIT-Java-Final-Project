package com.skillbridge.skill.application;

import com.skillbridge.skill.api.dto.request.CreateSkillRequest;
import com.skillbridge.skill.api.dto.response.SkillResponse;
import com.skillbridge.skill.api.mapper.SkillMapper;
import com.skillbridge.skill.domain.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final SkillMapper skillMapper;

    public SkillService(SkillRepository skillRepository, SkillMapper skillMapper) {
        this.skillRepository = skillRepository;
        this.skillMapper = skillMapper;
    }

    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(skillMapper::toResponse)
                .toList();
    }

    public SkillResponse getSkillById(UUID id) {
        return skillRepository.findById(id)
                .map(skillMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + id));
    }

    public SkillResponse createSkill(CreateSkillRequest request) {
        Skill skill = Skill.builder()
                .name(request.getName())
                .category(request.getCategory())
                .description(request.getDescription())
                .build();

        return skillMapper.toResponse(skillRepository.save(skill));
    }

    public List<SkillResponse> searchSkills(String query) {
        if (query == null || query.isBlank()) {
            return getAllSkills();
        }

        return skillRepository.findByNameContainingIgnoreCase(query).stream()
                .map(skillMapper::toResponse)
                .toList();
    }

    public void deleteSkill(UUID id) {
        skillRepository.deleteById(id);
    }
}
