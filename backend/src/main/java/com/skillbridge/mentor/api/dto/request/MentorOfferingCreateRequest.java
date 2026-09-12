package com.skillbridge.mentor.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import com.skillbridge.mentor.domain.entity.MentorAvailabilitySlot;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

@Data
public class MentorOfferingCreateRequest {
    @NotNull
    private UUID teachUserSkillId;

    @NotNull
    @Min(0)
    @Max(10000)
    private Integer pointCost;

    @NotNull
    private Boolean pointsEnabled;

    @NotNull
    private Boolean skillSwapEnabled;

    @NotNull
    private Boolean volunteerEnabled;

    @NotNull
    @Min(15)
    @Max(180)
    private Integer duration;

    @Size(max = 500)
    private String availabilityText;

    @NotEmpty(message = "Add at least one available date and time window")
    @Valid
    private List<MentorAvailabilitySlot> availabilitySlots;
}
