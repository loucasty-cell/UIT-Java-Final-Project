package com.skillbridge.user.api.dto.request;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillCreateRequest {

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    @NotNull(message = "Direction (TEACH or LEARN) is required")
    private Direction direction;

    @NotNull(message = "Proficiency level is required")
    private Level level;
}

