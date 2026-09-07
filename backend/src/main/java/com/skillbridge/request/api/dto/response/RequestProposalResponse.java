package com.skillbridge.request.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class RequestProposalResponse {
    private UUID id;
    private UserSummaryResponse requester;
    private UserSummaryResponse responder;
    private SkillSummaryResponse offeredSkill;
    private SkillSummaryResponse requestedSkill;
    private Integer pointCost;
    private Boolean pointsHeld;
    private String message;
    private SwapRequestStatus status;
    private UUID sessionId;
    private OffsetDateTime acceptedAt;
    private OffsetDateTime rejectedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime cancelledAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
