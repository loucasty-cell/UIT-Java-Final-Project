package com.skillbridge.skill.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class SkillResponse {
    private UUID id;
    private String name;
    private String category;
    private String description;
}
