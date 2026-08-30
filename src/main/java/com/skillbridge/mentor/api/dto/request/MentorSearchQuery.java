package com.skillbridge.mentor.api.dto.request;

import com.skillbridge.shared.domain.model.Level;
import com.skillbridge.shared.domain.model.Mode;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class MentorSearchQuery {
    @Size(max = 100)
    private String q;
    private UUID skillId;
    private Level level;
    private Mode mode;
    private Integer page;
    private Integer size;
    private String sort;
}
