package com.skillbridge.moderation.api.dto.request;

import com.skillbridge.admin.domain.model.ReportTargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class FlagContentRequest {

    @NotNull
    private UUID reporterId;

    @NotNull
    private ReportTargetType targetType;

    @NotNull
    private UUID targetId;

    @NotBlank
    @Size(max = 100)
    private String reason;

    @Size(max = 2000)
    private String details;
}
