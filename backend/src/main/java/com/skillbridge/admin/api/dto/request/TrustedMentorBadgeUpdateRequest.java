package com.skillbridge.admin.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TrustedMentorBadgeUpdateRequest {

    @NotNull(message = "Trusted mentor badge decision is required")
    private Boolean trustedMentor;
}
