package com.skillbridge.session.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class SessionResponse {
    private UUID id;
    private UUID swapRequestId;
    private UserSummaryResponse requester;
    private UserSummaryResponse responder;
    private SkillSummaryResponse offeredSkill;
    private SkillSummaryResponse requestedSkill;
    private Integer pointCost;
    private SwapSessionStatus status;
    private OffsetDateTime acceptedAt;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingUrl;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
