package com.skillbridge.learningrequest.api.dto.response;

import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.domain.model.SessionMode;
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
public class LearningRequestResponse {

    private UUID id;
    private UUID learnerId;
    private String learnerName;
    private UUID mentorId;
    private String mentorName;
    private UUID mentorOfferingId;
    private SkillSummaryResponse requestedSkill;
    private UUID offeredUserSkillId;
    private SessionMode mode;
    private Integer pointCost;
    private Boolean pointsHeld;
    private OffsetDateTime scheduledStart;
    private Integer durationMinutes;
    private String message;
    private LearningRequestStatus status;
    private UUID sessionId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
