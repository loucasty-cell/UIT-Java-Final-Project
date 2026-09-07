package com.skillbridge.milestone.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneProgressResponse {

    private UUID id;
    private String code;
    private String title;
    private String description;
    private String conditionType;
    private Integer conditionValue;
    private Integer currentProgress;
    private Integer pointsReward;
    private String icon;
    private Boolean achieved;
    private OffsetDateTime achievedAt;
}
