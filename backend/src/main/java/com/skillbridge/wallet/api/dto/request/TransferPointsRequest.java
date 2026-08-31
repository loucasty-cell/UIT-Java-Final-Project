package com.skillbridge.wallet.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TransferPointsRequest {

    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    @Max(value = 10000, message = "Amount cannot exceed 10000")
    private Integer amount;

    private String reason;
}
