package com.skillbridge.mentorapplication.api.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SubmitMentorApplicationRequest {

    @NotEmpty(message = "At least one teaching skill ID is required")
    private List<UUID> teachSkillIds;

    @Size(max = 2000, message = "Experience description must not exceed 2000 characters")
    private String experience;

    @Size(max = 2000, message = "Motivation description must not exceed 2000 characters")
    private String motivation;

    private List<UUID> certificateIds;
}
