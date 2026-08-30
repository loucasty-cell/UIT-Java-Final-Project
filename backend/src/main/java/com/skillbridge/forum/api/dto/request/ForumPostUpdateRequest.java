package com.skillbridge.forum.api.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ForumPostUpdateRequest {
    @Size(min = 5, max = 150)
    private String title;

    @Size(min = 1, max = 10)
    private List<UUID> skillIds;

    @Size(min = 20, max = 5000)
    private String description;

    @Size(max = 500)
    private String availabilityText;

    private Boolean active;
}
