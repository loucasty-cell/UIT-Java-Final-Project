package com.skillbridge.mentor.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import com.skillbridge.mentor.domain.entity.MentorAvailabilitySlot;
import jakarta.validation.Valid;

import java.util.List;

@Data
public class MentorOfferingUpdateRequest {
    @Min(0)
    @Max(10000)
    private Integer pointCost;
    private Boolean pointsEnabled;
    private Boolean skillSwapEnabled;
    private Boolean volunteerEnabled;
    @Min(15)
    @Max(180)
    private Integer duration;
    @Size(max = 500)
    private String availabilityText;
    @Valid
    private List<MentorAvailabilitySlot> availabilitySlots;
    private Boolean active;
}
