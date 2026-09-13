package com.skillbridge.admin.api.dto.request;

import com.skillbridge.admin.domain.model.WarningReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AccountWarningRequest {

    @NotNull(message = "Warning reason is required")
    private WarningReason reason;

    @NotBlank(message = "Warning message must not be blank")
    @Size(min = 10, max = 500, message = "Warning message must be between 10 and 500 characters")
    private String message;

    @NotNull(message = "Review evidence is required")
    @jakarta.validation.constraints.Size(min = 3, message = "At least three verified low reviews are required")
    private List<UUID> reviewIds;
}
