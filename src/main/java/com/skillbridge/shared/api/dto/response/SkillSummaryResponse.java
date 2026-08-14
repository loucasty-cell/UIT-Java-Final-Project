package com.skillbridge.shared.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class SkillSummaryResponse {
    private UUID id;
    private String name;
    private String slug;
}
