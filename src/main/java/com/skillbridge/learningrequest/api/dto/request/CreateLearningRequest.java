package com.skillbridge.learningrequest.api.dto.request;

import com.skillbridge.shared.domain.model.SessionMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CreateLearningRequest {

    @NotNull(message = "Mentor ID is required")
    private UUID mentorId;

    private UUID mentorOfferingId;

    @NotNull(message = "Requested Skill ID is required")
    private UUID requestedSkillId;

    @NotNull(message = "Session mode (POINTS, SKILL_SWAP, VOLUNTEER) is required")
    private SessionMode mode;

    private UUID offeredUserSkillId;

    @NotNull(message = "Scheduled start time is required")
    @Future(message = "Scheduled start time must be in the future")
    private OffsetDateTime scheduledStart;

    private Integer durationMinutes = 60;

    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;
}
