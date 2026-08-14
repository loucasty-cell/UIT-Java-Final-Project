package com.skillbridge.mentor.api.dto.response;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class AvailabilityResponse {
    private UUID mentorId;
    private List<OffsetDateTime> availableSlots;
}
