package com.skillbridge.review.api.dto.response;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.skillbridge.review.domain.model.ReviewModerationStatus;

@Data
public class ReviewResponse {
    private UUID id;
    private UUID sessionId;
    private UUID reviewerId;
    private String reviewerName;
    private UUID revieweeId;
    private UUID skillId;
    private Integer rating;
    private String feedback;
    private ReviewModerationStatus moderationStatus;
    private Double revieweeAverageRating;
    private Long revieweeReviewCount;
    private Double skillAverageRating;
    private Long skillReviewCount;
    private OffsetDateTime createdAt;
}
