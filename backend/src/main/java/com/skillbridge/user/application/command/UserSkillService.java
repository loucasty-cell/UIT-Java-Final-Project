package com.skillbridge.user.application.command;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.api.dto.request.UserSkillCreateRequest;
import com.skillbridge.user.api.dto.request.CustomUserSkillCreateRequest;
import com.skillbridge.user.api.dto.request.UserSkillUpdateRequest;
import com.skillbridge.user.api.dto.response.UserSkillResponse;
import com.skillbridge.user.api.mapper.UserSkillMapper;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final UserSkillMapper userSkillMapper;

    @Transactional(readOnly = true)
    public List<UserSkillResponse> getUserSkills(Direction direction) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<UserSkill> userSkills = (direction != null)
                ? userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(currentUserId, direction)
                : userSkillRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);

        return userSkills.stream()
                .map(us -> {
                    Skill skill = skillRepository.findById(us.getSkillId()).orElse(null);
                    return userSkillMapper.toResponse(us, skill);
                })
                .toList();
    }

    public UserSkillResponse createUserSkill(UserSkillCreateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new IllegalArgumentException("Skill not found with ID: " + request.getSkillId()));

        if (userSkillRepository.existsByUserIdAndSkillIdAndDirection(currentUserId, request.getSkillId(), request.getDirection())) {
            throw new IllegalArgumentException("You have already added this skill under " + request.getDirection());
        }

        UserSkill userSkill = new UserSkill();
        userSkill.setId(UUID.randomUUID());
        userSkill.setUserId(currentUserId);
        userSkill.setSkillId(request.getSkillId());
        userSkill.setDirection(request.getDirection());
        userSkill.setLevel(request.getLevel());

        UserSkill saved = userSkillRepository.save(userSkill);
        return userSkillMapper.toResponse(saved, skill);
    }

    public UserSkillResponse createCustomUserSkill(CustomUserSkillCreateRequest request) {
        String name = request.getName().trim().replaceAll("\\s+", " ");
        Skill skill = skillRepository.findFirstByNameIgnoreCase(name).orElseGet(() ->
                skillRepository.save(Skill.builder()
                        .name(name)
                        .category(request.getCategory() == null || request.getCategory().isBlank()
                                ? "Community"
                                : request.getCategory().trim())
                        .description("Community-added skill")
                        .build()));
        UserSkillCreateRequest create = UserSkillCreateRequest.builder()
                .skillId(skill.getId())
                .direction(request.getDirection())
                .level(request.getLevel())
                .build();
        return createUserSkill(create);
    }

    public UserSkillResponse updateUserSkill(UUID id, UserSkillUpdateRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserSkill userSkill = userSkillRepository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User skill not found: " + id));

        userSkill.setLevel(request.getLevel());
        UserSkill saved = userSkillRepository.save(userSkill);
        Skill skill = skillRepository.findById(saved.getSkillId()).orElse(null);
        return userSkillMapper.toResponse(saved, skill);
    }

    public void deleteUserSkill(UUID id) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserSkill userSkill = userSkillRepository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("User skill not found: " + id));

        userSkillRepository.delete(userSkill);
    }
}

