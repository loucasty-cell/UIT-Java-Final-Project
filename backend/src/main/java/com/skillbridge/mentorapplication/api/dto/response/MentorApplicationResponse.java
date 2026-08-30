package com.skillbridge.mentorapplication.api.dto.response;

import com.skillbridge.mentorapplication.domain.model.MentorApplicationStatus;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorApplicationResponse {

    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private MentorApplicationStatus status;
    private String experience;
    private String motivation;
    private String adminNotes;
    private List<SkillSummaryResponse> skills;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
