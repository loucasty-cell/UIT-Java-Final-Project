package com.skillbridge.admin.application;

import com.skillbridge.admin.application.command.ReviewModerationPolicy;
import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class ReviewModerationPolicyTest {
    private final UUID userId = UUID.randomUUID();
    private final ReviewRepository reviews = mock(ReviewRepository.class);
    private final AccountWarningRepository warnings = mock(AccountWarningRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final ReviewModerationPolicy policy = new ReviewModerationPolicy(reviews, warnings, users);

    @Test
    void recommendsWarningAtThreePublishedLowReviews() {
        when(reviews.findByRevieweeIdAndModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                userId, ReviewModerationStatus.DISMISSED, 2))
                .thenReturn(List.of(review(OffsetDateTime.now()), review(OffsetDateTime.now()), review(OffsetDateTime.now())));
        when(warnings.countByUserId(userId)).thenReturn(0L);
        when(warnings.findFirstByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Optional.empty());
        when(users.findById(userId)).thenReturn(Optional.of(new User()));
        assertEquals("WARN", policy.assess(userId).recommendedAction());
    }

    @Test
    void requiresTwoNewLowReviewsAfterTheLatestSuspension() {
        OffsetDateTime warningAt = OffsetDateTime.now().minusDays(10);
        OffsetDateTime suspensionAt = OffsetDateTime.now().minusDays(2);
        AccountWarning warning = new AccountWarning();
        warning.setCreatedAt(warningAt);
        User user = new User();
        user.setLastSuspendedAt(suspensionAt);
        when(warnings.countByUserId(userId)).thenReturn(1L);
        when(warnings.findFirstByUserIdOrderByCreatedAtDesc(userId)).thenReturn(Optional.of(warning));
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(reviews.findByRevieweeIdAndModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                userId, ReviewModerationStatus.DISMISSED, 2))
                .thenReturn(List.of(
                        review(OffsetDateTime.now().minusHours(1)),
                        review(OffsetDateTime.now().minusDays(3)),
                        review(OffsetDateTime.now().minusDays(4))));
        assertEquals("NONE", policy.assess(userId).recommendedAction());

        when(reviews.findByRevieweeIdAndModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                userId, ReviewModerationStatus.DISMISSED, 2))
                .thenReturn(List.of(
                        review(OffsetDateTime.now().minusMinutes(30)),
                        review(OffsetDateTime.now().minusHours(1)),
                        review(OffsetDateTime.now().minusDays(3))));
        assertEquals("SUSPEND", policy.assess(userId).recommendedAction());
    }

    private Review review(OffsetDateTime createdAt) {
        Review review = new Review();
        review.setCreatedAt(createdAt);
        return review;
    }
}
