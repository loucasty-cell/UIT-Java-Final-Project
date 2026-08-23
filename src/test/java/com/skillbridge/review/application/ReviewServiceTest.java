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
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class ReviewServiceTest {

    @Test
    void submitsReviewForCompletedSessionAndReturnsUpdatedAverages() {
        Fixture fixture = new Fixture();
        fixture.existingReviews.add(review(4));

        ReviewResponse response = fixture.service.submitReview(fixture.session.getId(), fixture.request(2));

        assertEquals(2, response.getRating());
        assertEquals(3.0, response.getRevieweeAverageRating());
        assertEquals(2L, response.getRevieweeReviewCount());
        assertEquals(3.0, response.getSkillAverageRating());
        assertEquals(2L, response.getSkillReviewCount());
    }

    @Test
    void rejectsReviewForUncompletedSession() {
        Fixture fixture = new Fixture();
        fixture.session.setStatus(SwapSessionStatus.STARTED);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertEquals("Reviews can only be submitted for completed sessions", exception.getMessage());
    }

    @Test
    void rejectsDuplicateReviewerForSession() {
        Fixture fixture = new Fixture();
        fixture.duplicateExists = true;

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertEquals("Reviewer has already reviewed this session", exception.getMessage());
    }

    private Review review(int rating) {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setRating(rating);
        review.setCreatedAt(OffsetDateTime.now());
        return review;
    }

    private class Fixture {
        private final UUID requesterId = UUID.randomUUID();
        private final UUID responderId = UUID.randomUUID();
        private final UUID skillId = UUID.randomUUID();
        private final SwapSession session = session();
        private final List<Review> existingReviews = new ArrayList<>();
        private boolean duplicateExists;
        private final ReviewService service = new ReviewService(
                reviewRepository(),
                sessionRepository(),
                userRepository(),
                skillRepository(),
                new ReviewMapper()
        );

        SubmitReviewRequest request(int rating) {
            SubmitReviewRequest request = new SubmitReviewRequest();
            request.setReviewerId(requesterId);
            request.setRevieweeId(responderId);
            request.setSkillId(skillId);
            request.setRating(rating);
            request.setFeedback("Helpful");
            return request;
        }

        private SwapSession session() {
            SwapSession session = new SwapSession();
            session.setId(UUID.randomUUID());
            session.setSwapRequestId(UUID.randomUUID());
            session.setRequesterId(requesterId);
            session.setResponderId(responderId);
            session.setOfferedSkillId(skillId);
            session.setRequestedSkillId(UUID.randomUUID());
            session.setStatus(SwapSessionStatus.COMPLETED);
            session.setAcceptedAt(OffsetDateTime.now().minusDays(1));
            session.setCompletedAt(OffsetDateTime.now());
            return session;
        }

        private ReviewRepository reviewRepository() {
            return ReviewRepository.class.cast(Proxy.newProxyInstance(
                    ReviewRepository.class.getClassLoader(),
                    new Class<?>[]{ReviewRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "existsBySessionIdAndReviewerId" -> duplicateExists;
                        case "save" -> {
                            Review review = (Review) args[0];
                            existingReviews.add(review);
                            yield review;
                        }
                        case "findByRevieweeId", "findBySkillId" -> List.copyOf(existingReviews);
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "ReviewRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }

        private SwapSessionRepository sessionRepository() {
            return SwapSessionRepository.class.cast(Proxy.newProxyInstance(
                    SwapSessionRepository.class.getClassLoader(),
                    new Class<?>[]{SwapSessionRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "findById" -> Optional.of(session);
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "SwapSessionRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }

        private UserRepository userRepository() {
            return UserRepository.class.cast(Proxy.newProxyInstance(
                    UserRepository.class.getClassLoader(),
                    new Class<?>[]{UserRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "existsById" -> true;
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "UserRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }

        private SkillRepository skillRepository() {
            return SkillRepository.class.cast(Proxy.newProxyInstance(
                    SkillRepository.class.getClassLoader(),
                    new Class<?>[]{SkillRepository.class},
                    (proxy, method, args) -> switch (method.getName()) {
                        case "existsById" -> true;
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "SkillRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }
    }
}
