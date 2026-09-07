package com.skillbridge.admin.api.dto.request;

import com.skillbridge.admin.domain.model.WarningReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AccountWarningRequest {

    @NotNull(message = "Warning reason is required")
    private WarningReason reason;

    @NotBlank(message = "Warning message must not be blank")
    @Size(min = 10, max = 2000, message = "Warning message must be between 10 and 2000 characters")
    private String message;
}
