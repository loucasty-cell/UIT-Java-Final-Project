package com.skillbridge.review.application;

import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.api.mapper.ReviewMapper;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SwapSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ReviewMapper reviewMapper;

    public ReviewResponse submitReview(UUID sessionId, SubmitReviewRequest request) {
        SwapSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
        if (session.getStatus() != SwapSessionStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be submitted for completed sessions");
        }
        validateParticipant(session, request.getReviewerId(), "Reviewer must be a session participant");
        validateParticipant(session, request.getRevieweeId(), "Reviewee must be a session participant");
        if (request.getReviewerId().equals(request.getRevieweeId())) {
            throw new IllegalArgumentException("Reviewer and reviewee must be different users");
        }
        if (!userRepository.existsById(request.getReviewerId())) {
            throw new IllegalArgumentException("Reviewer not found: " + request.getReviewerId());
        }
        if (!userRepository.existsById(request.getRevieweeId())) {
            throw new IllegalArgumentException("Reviewee not found: " + request.getRevieweeId());
        }
        if (!session.getOfferedSkillId().equals(request.getSkillId())
                && !session.getRequestedSkillId().equals(request.getSkillId())) {
            throw new IllegalArgumentException("Reviewed skill must belong to the session");
        }
        if (!skillRepository.existsById(request.getSkillId())) {
            throw new IllegalArgumentException("Skill not found: " + request.getSkillId());
        }
        if (reviewRepository.existsBySessionIdAndReviewerId(sessionId, request.getReviewerId())) {
            throw new IllegalStateException("Reviewer has already reviewed this session");
        }

        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(sessionId);
        review.setReviewerId(request.getReviewerId());
        review.setRevieweeId(request.getRevieweeId());
        review.setSkillId(request.getSkillId());
        review.setRating(request.getRating());
        review.setFeedback(request.getFeedback());
        review.setCreatedAt(OffsetDateTime.now());
        review.setVersion(0L);

        Review saved = reviewRepository.save(review);
        RatingStats userStats = stats(reviewRepository.findByRevieweeId(request.getRevieweeId()));
        RatingStats skillStats = stats(reviewRepository.findBySkillId(request.getSkillId()));

        return reviewMapper.toResponse(
                saved,
                userStats.averageRating(),
                userStats.reviewCount(),
                skillStats.averageRating(),
                skillStats.reviewCount()
        );
    }

    private void validateParticipant(SwapSession session, UUID userId, String message) {
        if (!session.getRequesterId().equals(userId) && !session.getResponderId().equals(userId)) {
            throw new IllegalArgumentException(message);
        }
    }

    private RatingStats stats(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return new RatingStats(0.0, 0);
        }

        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
        return new RatingStats(average, reviews.size());
    }

    private record RatingStats(double averageRating, long reviewCount) {
    }
}
