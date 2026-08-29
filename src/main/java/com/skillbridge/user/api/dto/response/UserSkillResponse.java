package com.skillbridge.user.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillResponse {

    private UUID id;
    private SkillSummaryResponse skill;
    private Direction direction;
    private Level level;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}

