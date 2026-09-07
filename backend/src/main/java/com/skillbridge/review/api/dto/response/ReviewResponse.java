package com.skillbridge.review.api.dto.response;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ReviewResponse {
    private UUID id;
    private UUID sessionId;
    private UUID reviewerId;
    private UUID revieweeId;
    private UUID skillId;
    private Integer rating;
    private String feedback;
    private Double revieweeAverageRating;
    private Long revieweeReviewCount;
    private Double skillAverageRating;
    private Long skillReviewCount;
    private OffsetDateTime createdAt;
}
