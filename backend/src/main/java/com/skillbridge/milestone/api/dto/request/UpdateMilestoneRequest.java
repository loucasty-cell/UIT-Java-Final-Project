package com.skillbridge.milestone.api.dto.request;

import lombok.Data;

@Data
public class UpdateMilestoneRequest {
    private String title;
    private String description;
    private Integer conditionValue;
    private Integer pointsReward;
    private String icon;
}
