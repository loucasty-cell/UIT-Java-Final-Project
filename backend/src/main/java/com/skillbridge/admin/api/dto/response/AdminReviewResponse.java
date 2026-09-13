package com.skillbridge.admin.api.dto.response;

import com.skillbridge.review.domain.model.ReviewModerationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminReviewResponse {
    private UUID id;
    private UUID sessionId;
    private UUID reviewerId;
    private String reviewerName;
    private UUID revieweeId;
    private String revieweeName;
    private UUID skillId;
    private Integer rating;
    private String feedback;
    private ReviewModerationStatus status;
    private UUID reviewedBy;
    private OffsetDateTime reviewedAt;
    private String adminNotes;
    private OffsetDateTime createdAt;
    private Long lowReviewCount;
    private Long lowReviewsSinceLastAction;
    private String recommendedAction;
}
