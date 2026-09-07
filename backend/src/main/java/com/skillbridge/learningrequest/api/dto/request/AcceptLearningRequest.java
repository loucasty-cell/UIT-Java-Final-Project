package com.skillbridge.learningrequest.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AcceptLearningRequest {
    @NotBlank(message = "A Google Meet link is required when accepting a session")
    @Size(max = 500)
    @Pattern(regexp = "https://meet\\.google\\.com/[^\\s]+", message = "Enter a valid https://meet.google.com/ link")
    private String meetingUrl;
}
