package com.skillbridge.admin.application;

import com.skillbridge.admin.api.dto.response.AdminReviewResponse;
import com.skillbridge.admin.application.command.AdminReviewService;
import com.skillbridge.admin.application.command.ReviewModerationPolicy;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminReviewServiceTest {
    @Test
    void listsOnlyPublishedLowRatingsThatNeedAttention() {
        UUID reviewerId = UUID.randomUUID();
        UUID revieweeId = UUID.randomUUID();
        ReviewRepository reviews = mock(ReviewRepository.class);
        UserRepository users = mock(UserRepository.class);
        ReviewModerationPolicy policy = mock(ReviewModerationPolicy.class);
        Review review = review(reviewerId, revieweeId);
        PageRequest page = PageRequest.of(0, 50);

        when(reviews.findByModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                ReviewModerationStatus.DISMISSED, 2, page
        )).thenReturn(new PageImpl<>(List.of(review), page, 1));
        when(users.findById(reviewerId)).thenReturn(Optional.of(user(reviewerId, "Reviewer")));
        when(users.findById(revieweeId)).thenReturn(Optional.of(user(revieweeId, "Reviewee")));
        when(policy.assess(revieweeId)).thenReturn(new ReviewModerationPolicy.Assessment(
                List.of(review), 0, 1, "NONE", null
        ));

        var result = new AdminReviewService(reviews, users, policy).listNeedsAttention(page);

        assertEquals(1, result.getContent().size());
        AdminReviewResponse response = result.getContent().getFirst();
        assertEquals(1, response.getRating());
        assertEquals(1L, response.getLowReviewCount());
        verify(reviews).findByModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                ReviewModerationStatus.DISMISSED, 2, page
        );
    }

    private Review review(UUID reviewerId, UUID revieweeId) {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(UUID.randomUUID());
        review.setReviewerId(reviewerId);
        review.setRevieweeId(revieweeId);
        review.setSkillId(UUID.randomUUID());
        review.setRating(1);
        review.setFeedback("The session did not meet the agreed expectations.");
        review.setModerationStatus(ReviewModerationStatus.PENDING);
        review.setCreatedAt(OffsetDateTime.now());
        return review;
    }

    private User user(UUID id, String name) {
        User user = new User();
        user.setId(id);
        user.setFirstName(name);
        user.setLastName("Person");
        return user;
    }
}
