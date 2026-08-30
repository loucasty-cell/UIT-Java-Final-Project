package com.skillbridge.user.api.dto.request;

import com.skillbridge.shared.domain.model.Level;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillUpdateRequest {

    @NotNull(message = "Proficiency level is required")
    private Level level;
}

