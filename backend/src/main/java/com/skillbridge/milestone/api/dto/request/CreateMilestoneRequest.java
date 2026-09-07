package com.skillbridge.milestone.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateMilestoneRequest {

    @NotBlank(message = "Milestone code is required")
    private String code;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Condition type is required")
    private String conditionType;

    @NotNull(message = "Condition value is required")
    @Positive(message = "Condition value must be positive")
    private Integer conditionValue;

    @NotNull(message = "Points reward is required")
    @Positive(message = "Points reward must be positive")
    private Integer pointsReward;

    private String icon;
}
