package com.skillbridge.user.api.dto.response;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserSkillResponse {
    private UUID id;
    private UUID skillId;
    private String skillName;
    private String category;
    private Direction direction;
    private Level level;
}
