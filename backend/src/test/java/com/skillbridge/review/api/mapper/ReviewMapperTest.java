package com.skillbridge.review.api.mapper;

import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.domain.entity.Review;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

public class ReviewMapperTest {

    private final ReviewMapper mapper = new ReviewMapper();

    @Test
    void mapsReviewEntityToResponseWithStats() {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(UUID.randomUUID());
        review.setReviewerId(UUID.randomUUID());
        review.setRevieweeId(UUID.randomUUID());
        review.setSkillId(UUID.randomUUID());
        review.setRating(5);
        review.setFeedback("Exceptional mentor!");
        review.setCreatedAt(OffsetDateTime.now());

        ReviewResponse response = mapper.toResponse(review, 4.8, 12L, 4.9, 15L);

        assertNotNull(response);
        assertEquals(review.getId(), response.getId());
        assertEquals(review.getSessionId(), response.getSessionId());
        assertEquals(review.getReviewerId(), response.getReviewerId());
        assertEquals(review.getRevieweeId(), response.getRevieweeId());
        assertEquals(review.getSkillId(), response.getSkillId());
        assertEquals(5, response.getRating());
        assertEquals("Exceptional mentor!", response.getFeedback());
        assertEquals(4.8, response.getRevieweeAverageRating());
        assertEquals(12L, response.getRevieweeReviewCount());
        assertEquals(4.9, response.getSkillAverageRating());
        assertEquals(15L, response.getSkillReviewCount());
    }

    @Test
    void mapsNullReviewToNull() {
        assertNull(mapper.toResponse(null, 0.0, 0L, 0.0, 0L));
    }
}
