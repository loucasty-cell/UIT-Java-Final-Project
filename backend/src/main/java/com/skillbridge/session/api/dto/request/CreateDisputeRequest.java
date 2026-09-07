package com.skillbridge.session.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDisputeRequest {

    @NotBlank(message = "Dispute reason is required")
    @Size(max = 100, message = "Reason must not exceed 100 characters")
    private String reason;

    @NotBlank(message = "Dispute details are required")
    @Size(max = 2000, message = "Details must not exceed 2000 characters")
    private String details;
}

