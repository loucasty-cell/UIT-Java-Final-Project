package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.response.AdminReviewResponse;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.shared.api.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReviewModerationPolicy moderationPolicy;

    @Transactional(readOnly = true)
    public PageResponse<AdminReviewResponse> listNeedsAttention(Pageable pageable) {
        Page<Review> reviews = reviewRepository
                .findByModerationStatusNotAndRatingLessThanEqualOrderByCreatedAtDesc(
                        ReviewModerationStatus.DISMISSED,
                        ReviewModerationPolicy.LOW_RATING_MAX,
                        pageable
                );
        return PageResponse.from(reviews, this::toResponse);
    }

    private AdminReviewResponse toResponse(Review review) {
        ReviewModerationPolicy.Assessment assessment = moderationPolicy.assess(review.getRevieweeId());
        return AdminReviewResponse.builder()
                .id(review.getId())
                .sessionId(review.getSessionId())
                .reviewerId(review.getReviewerId())
                .reviewerName(displayName(review.getReviewerId()))
                .revieweeId(review.getRevieweeId())
                .revieweeName(displayName(review.getRevieweeId()))
                .skillId(review.getSkillId())
                .rating(review.getRating())
                .feedback(review.getFeedback())
                .status(review.getModerationStatus())
                .reviewedBy(review.getReviewedBy())
                .reviewedAt(review.getReviewedAt())
                .adminNotes(review.getAdminNotes())
                .createdAt(review.getCreatedAt())
                .lowReviewCount((long) assessment.lowReviews().size())
                .lowReviewsSinceLastAction(assessment.lowReviewsSinceLastAction())
                .recommendedAction(assessment.recommendedAction())
                .build();
    }

    private String displayName(UUID userId) {
        return userRepository.findById(userId).map(this::displayName).orElse("Unknown user");
    }

    private String displayName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) return user.getDisplayName();
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
