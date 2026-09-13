package com.skillbridge.admin.api.dto.request;

import com.skillbridge.admin.domain.model.AccountStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AccountStatusUpdateRequest {

    @NotNull(message = "Account status is required")
    private AccountStatus status;

    @NotBlank(message = "Reason must not be blank")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;

    private List<UUID> reviewIds = List.of();
}
