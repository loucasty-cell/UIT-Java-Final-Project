package com.skillbridge.forum.api.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class ForumEngagementResponse {
    private UUID postId;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean likedByMe;
}
