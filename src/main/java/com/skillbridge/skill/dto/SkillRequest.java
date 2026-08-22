package com.skillbridge.skill.dto;

import lombok.Data;

@Data
public class SkillRequest {
    private String name;
    private String description;
    private String category;
}