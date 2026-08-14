package com.skillbridge.shared.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class UserSummaryResponse {
    private UUID id;
    private String displayName;
    private String major;
    private Integer yearOfStudy;
    private String avatarUrl;
    private Boolean mentorBadge;
}
