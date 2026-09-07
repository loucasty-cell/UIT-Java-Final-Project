package com.skillbridge.mentor.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Mode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class MentorOfferingResponse {
    private UUID id;
    private UserSummaryResponse mentor;
    private SkillSummaryResponse skill;
    private Integer price;
    private List<Mode> modes;
    private Integer duration;
    private String availability;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
