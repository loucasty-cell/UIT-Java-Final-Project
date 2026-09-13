package com.skillbridge.admin.application.command;

import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReviewModerationPolicy {
    public static final int LOW_RATING_MAX = 2;
    public static final int WARNING_THRESHOLD = 3;
    public static final int SUSPENSION_THRESHOLD_AFTER_WARNING = 2;

    private final ReviewRepository reviewRepository;
    private final AccountWarningRepository warningRepository;
    private final UserRepository userRepository;

    public Assessment assess(UUID userId) {
        List<Review> lowReviews = lowReviews(userId);
        long warningCount = warningRepository.countByUserId(userId);
        OffsetDateTime latestWarningAt = warningRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(AccountWarning::getCreatedAt)
                .orElse(null);
        OffsetDateTime lastSuspendedAt = userRepository.findById(userId)
                .map(user -> user.getLastSuspendedAt())
                .orElse(null);
        OffsetDateTime latestEnforcementAt = latestWarningAt;
        if (lastSuspendedAt != null && (latestEnforcementAt == null || lastSuspendedAt.isAfter(latestEnforcementAt))) {
            latestEnforcementAt = lastSuspendedAt;
        }
        OffsetDateTime boundary = latestEnforcementAt;
        long lowReviewsSinceLastAction = boundary == null
                ? lowReviews.size()
                : lowReviews.stream().filter(review -> review.getCreatedAt().isAfter(boundary)).count();

        String recommendedAction = "NONE";
        if (warningCount == 0 && lowReviews.size() >= WARNING_THRESHOLD) {
            recommendedAction = "WARN";
        } else if (warningCount > 0 && lowReviewsSinceLastAction >= SUSPENSION_THRESHOLD_AFTER_WARNING) {
            recommendedAction = "SUSPEND";
        }
        return new Assessment(lowReviews, warningCount, lowReviewsSinceLastAction, recommendedAction, latestEnforcementAt);
    }

    public List<Review> lowReviews(UUID userId) {
        return reviewRepository.findByRevieweeIdAndModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                userId,
                ReviewModerationStatus.DISMISSED,
                LOW_RATING_MAX
        );
    }

    public record Assessment(
            List<Review> lowReviews,
            long warningCount,
            long lowReviewsSinceLastAction,
            String recommendedAction,
            OffsetDateTime latestEnforcementAt
    ) {}
}
