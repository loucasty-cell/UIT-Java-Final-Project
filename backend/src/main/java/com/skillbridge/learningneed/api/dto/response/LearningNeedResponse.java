package com.skillbridge.learningneed.api.dto.response;

import lombok.Data;
import com.skillbridge.mentor.domain.entity.MentorAvailabilitySlot;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;
import com.skillbridge.shared.domain.model.SessionMode;

@Data
public class LearningNeedResponse {
    private UUID id;
    private UUID learnerId;
    private String learnerName;
    private UUID skillId;
    private String skillName;
    private String title;
    private String description;
    private String availabilityText;
    private List<MentorAvailabilitySlot> availabilitySlots;
    private Integer durationMinutes;
    private List<SessionMode> allowedModes;
    private String exchangeSkillName;
    private Long offerCount;
    private Boolean offeredByMe;
    private OffsetDateTime createdAt;
}
