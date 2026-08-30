package com.skillbridge.user.api.controller;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.user.api.dto.request.UserSkillCreateRequest;
import com.skillbridge.user.api.dto.request.UserSkillUpdateRequest;
import com.skillbridge.user.api.dto.response.UserSkillResponse;
import com.skillbridge.user.application.command.UserSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/skills")
@RequiredArgsConstructor
public class UserSkillController {

    private final UserSkillService userSkillService;

    @GetMapping
    public List<UserSkillResponse> getMySkills(@RequestParam(required = false) Direction direction) {
        return userSkillService.getUserSkills(direction);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserSkillResponse addSkill(@Valid @RequestBody UserSkillCreateRequest request) {
        return userSkillService.createUserSkill(request);
    }

    @PatchMapping("/{id}")
    public UserSkillResponse updateSkill(
            @PathVariable UUID id,
            @Valid @RequestBody UserSkillUpdateRequest request
    ) {
        return userSkillService.updateUserSkill(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(@PathVariable UUID id) {
        userSkillService.deleteUserSkill(id);
    }
}

