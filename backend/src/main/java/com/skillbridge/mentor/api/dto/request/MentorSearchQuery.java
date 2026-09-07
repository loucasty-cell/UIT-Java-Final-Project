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
    private String search;
    private UUID skillId;
    private Level level;
    private Mode mode;
    private Double minRating;
    private Integer page;
    private Integer size;
    private String sort;

    public String getEffectiveQuery() {
        if (q != null && !q.isBlank()) {
            return q;
        }
        if (search != null && !search.isBlank()) {
            return search;
        }
        return null;
    }
}
