package com.skillbridge.session.api.dto.response;

import com.skillbridge.swap.domain.model.SwapSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionConfirmationResponse {
    private UUID id;
    private SwapSessionStatus status;
    private Integer pointsReleased;
    private OffsetDateTime autoReleaseAt;
    private Boolean confirmedByMe;
    private Boolean confirmedByOther;
}
