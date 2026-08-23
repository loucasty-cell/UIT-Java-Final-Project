package com.skillbridge.review.application;

import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.api.mapper.ReviewMapper;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ReviewServiceTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void submitsReviewForCompletedSessionAndReturnsUpdatedAverages() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);
        fixture.existingReviews.add(review(4));

        ReviewResponse response = fixture.service.submitReview(fixture.session.getId(), fixture.request(2));

        assertNotNull(response);
        assertEquals(2, response.getRating());
        assertEquals(3.0, response.getRevieweeAverageRating());
        assertEquals(2L, response.getRevieweeReviewCount());
        assertEquals(3.0, response.getSkillAverageRating());
        assertEquals(2L, response.getSkillReviewCount());
    }

    @Test
    void submitsFirstReviewWhenNoPriorReviewsExist() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);

        ReviewResponse response = fixture.service.submitReview(fixture.session.getId(), fixture.request(5));

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals(5.0, response.getRevieweeAverageRating());
        assertEquals(1L, response.getRevieweeReviewCount());
        assertEquals(5.0, response.getSkillAverageRating());
        assertEquals(1L, response.getSkillReviewCount());
    }

    @Test
    void allowsResponderToReviewRequester() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.responderId);

        SubmitReviewRequest request = new SubmitReviewRequest();
        request.setRevieweeId(fixture.requesterId);
        request.setSkillId(fixture.requestedSkillId);
        request.setRating(4);
        request.setFeedback("Great session partner!");

        ReviewResponse response = fixture.service.submitReview(fixture.session.getId(), request);

        assertNotNull(response);
        assertEquals(fixture.responderId, response.getReviewerId());
        assertEquals(fixture.requesterId, response.getRevieweeId());
        assertEquals(4, response.getRating());
    }

    @Test
    void rejectsReviewForUncompletedSession() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);
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
        TestAuthContext.loginAs(fixture.requesterId);
        fixture.duplicateExists = true;

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertEquals("Reviewer has already reviewed this session", exception.getMessage());
    }

    @Test
    void rejectsSelfReview() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);

        SubmitReviewRequest request = fixture.request(5);
        request.setRevieweeId(fixture.requesterId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), request)
        );

        assertEquals("Reviewer and reviewee must be different users", exception.getMessage());
    }

    @Test
    void rejectsReviewWhenReviewerIsNotParticipant() {
        Fixture fixture = new Fixture();
        UUID outsiderId = UUID.randomUUID();
        fixture.validUserIds.add(outsiderId);
        TestAuthContext.loginAs(outsiderId);

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertEquals("Reviewer must be a session participant", exception.getMessage());
    }

    @Test
    void rejectsReviewWhenRevieweeIsNotParticipant() {
        Fixture fixture = new Fixture();
        UUID outsiderId = UUID.randomUUID();
        fixture.validUserIds.add(outsiderId);
        TestAuthContext.loginAs(fixture.requesterId);

        SubmitReviewRequest request = fixture.request(5);
        request.setRevieweeId(outsiderId);

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), request)
        );

        assertEquals("Reviewee must be a session participant", exception.getMessage());
    }

    @Test
    void rejectsReviewWhenSkillDoesNotBelongToSession() {
        Fixture fixture = new Fixture();
        UUID unrelatedSkillId = UUID.randomUUID();
        fixture.validSkillIds.add(unrelatedSkillId);
        TestAuthContext.loginAs(fixture.requesterId);

        SubmitReviewRequest request = fixture.request(5);
        request.setSkillId(unrelatedSkillId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), request)
        );

        assertEquals("Reviewed skill must belong to the session", exception.getMessage());
    }

    @Test
    void rejectsReviewWhenReviewerUserNotFound() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);
        fixture.validUserIds.remove(fixture.requesterId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertTrue(exception.getMessage().contains("Reviewer not found"));
    }

    @Test
    void rejectsReviewWhenRevieweeUserNotFound() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);
        fixture.validUserIds.remove(fixture.responderId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertTrue(exception.getMessage().contains("Reviewee not found"));
    }

    @Test
    void rejectsReviewWhenSkillNotFound() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);
        fixture.validSkillIds.remove(fixture.offeredSkillId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), fixture.request(5))
        );

        assertTrue(exception.getMessage().contains("Skill not found"));
    }

    @Test
    void rejectsReviewWhenSessionNotFound() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(UUID.randomUUID(), fixture.request(5))
        );

        assertTrue(exception.getMessage().contains("Session not found"));
    }

    @Test
    void rejectsReviewWithInvalidRatings() {
        Fixture fixture = new Fixture();
        TestAuthContext.loginAs(fixture.requesterId);

        SubmitReviewRequest low = fixture.request(0);
        IllegalArgumentException exLow = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), low)
        );
        assertEquals("Rating must be between 1 and 5", exLow.getMessage());

        SubmitReviewRequest high = fixture.request(6);
        IllegalArgumentException exHigh = assertThrows(
                IllegalArgumentException.class,
                () -> fixture.service.submitReview(fixture.session.getId(), high)
        );
        assertEquals("Rating must be between 1 and 5", exHigh.getMessage());
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
        private final UUID offeredSkillId = UUID.randomUUID();
        private final UUID requestedSkillId = UUID.randomUUID();
        private final Set<UUID> validUserIds = new HashSet<>();
        private final Set<UUID> validSkillIds = new HashSet<>();
        private final SwapSession session = session();
        private final List<Review> existingReviews = new ArrayList<>();
        private boolean duplicateExists;
        private final ReviewService service;

        Fixture() {
            validUserIds.add(requesterId);
            validUserIds.add(responderId);
            validSkillIds.add(offeredSkillId);
            validSkillIds.add(requestedSkillId);

            this.service = new ReviewService(
                    reviewRepository(),
                    sessionRepository(),
                    userRepository(),
                    skillRepository(),
                    new ReviewMapper()
            );
        }

        SubmitReviewRequest request(int rating) {
            SubmitReviewRequest request = new SubmitReviewRequest();
            request.setRevieweeId(responderId);
            request.setSkillId(offeredSkillId);
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
            session.setOfferedSkillId(offeredSkillId);
            session.setRequestedSkillId(requestedSkillId);
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
                        case "findById" -> args[0].equals(session.getId()) ? Optional.of(session) : Optional.empty();
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
                        case "existsById" -> validUserIds.contains((UUID) args[0]);
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
                        case "existsById" -> validSkillIds.contains((UUID) args[0]);
                        case "equals" -> proxy == args[0];
                        case "hashCode" -> System.identityHashCode(proxy);
                        case "toString" -> "SkillRepository test proxy";
                        default -> throw new UnsupportedOperationException(method.getName());
                    }
            ));
        }
    }
}
