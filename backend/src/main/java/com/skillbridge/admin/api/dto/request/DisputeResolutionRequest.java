package com.skillbridge.admin.api.dto.request;

import com.skillbridge.admin.domain.model.DisputeResolution;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DisputeResolutionRequest {

    @NotNull(message = "Resolution is required")
    private DisputeResolution resolution;

    @NotBlank(message = "Resolution note must not be blank")
    @Size(min = 10, max = 2000, message = "Resolution note must be between 10 and 2000 characters")
    private String note;
}
