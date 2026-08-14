package com.skillbridge.forum.api.dto.response;

import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ForumCommentResponse {
    private UUID id;
    private UUID postId;
    private UserSummaryResponse author;
    private String body;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
