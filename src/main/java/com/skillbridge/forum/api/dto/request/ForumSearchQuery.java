package com.skillbridge.forum.api.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ForumSearchQuery {
    @Size(max = 100)
    private String q;
    private UUID skillId;
    private UUID authorId;
    private Integer page;
    private Integer size;
    private String sort;
}
