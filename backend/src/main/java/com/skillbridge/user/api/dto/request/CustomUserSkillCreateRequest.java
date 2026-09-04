package com.skillbridge.user.api.dto.request;

import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomUserSkillCreateRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String category;

    @NotNull
    private Direction direction;

    @NotNull
    private Level level;
}
