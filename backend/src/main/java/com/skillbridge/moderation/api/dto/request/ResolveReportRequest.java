package com.skillbridge.moderation.api.dto.request;

import com.skillbridge.admin.domain.model.ReportStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class ResolveReportRequest {

    @NotNull
    private UUID moderatorId;

    @NotNull
    private ReportStatus status;

    @NotBlank
    @Size(max = 100)
    private String actionTaken;

    @Size(max = 2000)
    private String note;
}
