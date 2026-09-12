package com.skillbridge.forum.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import com.skillbridge.mentor.domain.entity.MentorAvailabilitySlot;

import java.util.List;
import java.util.UUID;

@Data
public class ForumPostCreateRequest {
    @NotNull
    @Size(min = 5, max = 150)
    private String title;

    @NotNull
    @Size(min = 1, max = 10)
    private List<UUID> skillIds;

    @NotNull
    @Size(min = 20, max = 5000)
    private String description;

    @Size(max = 500)
    private String availabilityText;

    @jakarta.validation.Valid
    private List<MentorAvailabilitySlot> availabilitySlots;

    @NotNull
    @Min(15)
    @Max(480)
    private Integer durationMinutes = 60;

    private Boolean active = true;
}
