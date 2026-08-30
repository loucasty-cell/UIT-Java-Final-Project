package com.skillbridge.admin.api.dto.response;

import com.skillbridge.admin.domain.model.WarningReason;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AccountWarningResponse {
    private UUID id;
    private UserSummaryResponse user;
    private UserSummaryResponse admin;
    private WarningReason reason;
    private String message;
    private OffsetDateTime createdAt;
}
