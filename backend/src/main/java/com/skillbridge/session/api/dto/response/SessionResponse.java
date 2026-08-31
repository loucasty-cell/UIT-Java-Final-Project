package com.skillbridge.session.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.SessionMode;
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
    private Integer pointCostSnapshot;
    private SwapSessionStatus status;
    private SessionMode mode;
    private OffsetDateTime acceptedAt;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime autoReleaseAt;
    private OffsetDateTime scheduledAt;
    private OffsetDateTime scheduledStart;
    private OffsetDateTime scheduledEnd;
    private Integer durationMinutes;
    private String meetingUrl;
    private String recordingUrl;
    private String notes;
    private UUID mentorId;
    private String mentorName;
    private UUID learnerId;
    private String learnerName;
    private String skillName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
