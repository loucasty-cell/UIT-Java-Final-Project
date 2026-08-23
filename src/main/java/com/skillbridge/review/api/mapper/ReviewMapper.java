package com.skillbridge.review.api.mapper;

import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.domain.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(
            Review review,
            double revieweeAverageRating,
            long revieweeReviewCount,
            double skillAverageRating,
            long skillReviewCount
    ) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setSessionId(review.getSessionId());
        response.setReviewerId(review.getReviewerId());
        response.setRevieweeId(review.getRevieweeId());
        response.setSkillId(review.getSkillId());
        response.setRating(review.getRating());
        response.setFeedback(review.getFeedback());
        response.setRevieweeAverageRating(revieweeAverageRating);
        response.setRevieweeReviewCount(revieweeReviewCount);
        response.setSkillAverageRating(skillAverageRating);
        response.setSkillReviewCount(skillReviewCount);
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}
