package com.skillbridge.forum.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ForumPostResponse {
    private UUID id;
    private UserSummaryResponse author;
    private String title;
    private String description;
    private List<SkillSummaryResponse> skillTags;
    private String availability;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean likedByMe;
    private OffsetDateTime timestamp;
    private Long version;
}
