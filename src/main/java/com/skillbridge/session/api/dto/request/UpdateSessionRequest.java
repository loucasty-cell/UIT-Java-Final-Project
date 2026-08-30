package com.skillbridge.session.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class UpdateSessionRequest {
    private OffsetDateTime scheduledAt;

    @Min(1)
    private Integer durationMinutes;

    @Size(max = 500)
    private String meetingUrl;

    @Size(max = 1000)
    private String notes;
}
