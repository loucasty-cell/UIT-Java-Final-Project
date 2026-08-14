package com.skillbridge.forum.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForumCommentCreateRequest {
    @NotNull
    @Size(min = 1, max = 2000)
    private String body;
}
