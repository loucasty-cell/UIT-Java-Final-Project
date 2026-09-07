package com.skillbridge.skill.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSkillRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String category;

    private String description;
}
