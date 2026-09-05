package com.skillbridge.learningneed.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.skillbridge.shared.domain.model.SessionMode;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class LearningNeedCreateRequest {
    @NotNull
    private UUID skillId;

    @NotNull
    @Size(min = 5, max = 150)
    private String title;

    @NotNull
    @Size(min = 20, max = 5000)
    private String description;

    @Size(max = 500)
    private String availabilityText;

    @NotNull
    @Min(15)
    @Max(480)
    private Integer durationMinutes = 60;

    @NotNull
    @Size(min = 1, max = 3)
    private List<SessionMode> allowedModes = List.of(SessionMode.VOLUNTEER);

    private UUID exchangeUserSkillId;
}
