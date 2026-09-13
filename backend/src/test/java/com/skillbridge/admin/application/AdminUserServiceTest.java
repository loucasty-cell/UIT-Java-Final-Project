package com.skillbridge.admin.application;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.request.TrustedMentorBadgeUpdateRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.application.command.AdminAuditService;
import com.skillbridge.admin.application.command.AdminUserService;
import com.skillbridge.admin.application.command.ReviewModerationPolicy;
import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.admin.domain.model.WarningReason;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.infrastructure.persistence.RefreshTokenRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminUserServiceTest {
    private final UUID adminId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UserRepository users = mock(UserRepository.class);
    private final UserRoleRepository roles = mock(UserRoleRepository.class);
    private final ReviewRepository reviews = mock(ReviewRepository.class);
    private final AccountWarningRepository warnings = mock(AccountWarningRepository.class);
    private final ReviewModerationPolicy policy = mock(ReviewModerationPolicy.class);
    private final NotificationService notifications = mock(NotificationService.class);
    private final RefreshTokenRepository tokens = mock(RefreshTokenRepository.class);
    private final AdminAuditService audit = mock(AdminAuditService.class);
    private final AdminMapper mapper = mock(AdminMapper.class);
    private final WalletRepository wallets = mock(WalletRepository.class);
    private final SwapSessionRepository sessions = mock(SwapSessionRepository.class);
    private final AdminUserService service = new AdminUserService(
            warnings, mapper, audit, users, roles, reviews, policy, notifications, tokens, wallets, sessions);

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void warningPersistsStatusAndCreatesProminentNotification() {
        TestAuthContext.loginAs(adminId);
        User user = user(AccountStatus.ACTIVE);
        List<Review> evidence = List.of(lowReview(), lowReview(), lowReview());
        evidence.getFirst().setModerationStatus(ReviewModerationStatus.PENDING);
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(roles.findByUserId(userId)).thenReturn(List.of());
        when(policy.assess(userId)).thenReturn(new ReviewModerationPolicy.Assessment(
                evidence, 0, 3, "WARN", null));
        when(reviews.findAllById(any())).thenReturn(evidence);
        when(warnings.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapper.toResponse(any(AccountWarning.class))).thenReturn(AccountWarningResponse.builder().build());

        AccountWarningRequest request = new AccountWarningRequest();
        request.setReason(WarningReason.POOR_REVIEWS);
        request.setMessage("Three published low reviews require an official warning.");
        request.setReviewIds(evidence.stream().map(Review::getId).toList());
        service.issueWarning(userId, request);

        assertEquals(AccountStatus.WARNED, user.getStatus());
        verify(users).save(user);
        verify(notifications).createNotification(
                eq(userId), eq(NotificationType.ACCOUNT_WARNING), eq("Important account warning"),
                contains("official warning"), eq("ACCOUNT_WARNING"), any(UUID.class));
        verify(audit).logEvent(eq(adminId), eq("ISSUE_WARNING"), eq("USER"), eq(userId), any(), any(), any(), isNull());
    }

    @Test
    void firstTemporarySuspensionLastsSevenDaysAndRevokesSessions() {
        TestAuthContext.loginAs(adminId);
        User user = user(AccountStatus.WARNED);
        OffsetDateTime warningAt = OffsetDateTime.now().minusDays(2);
        List<Review> evidence = List.of(lowReview(), lowReview());
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(roles.findByUserId(userId)).thenReturn(List.of());
        when(policy.assess(userId)).thenReturn(new ReviewModerationPolicy.Assessment(
                evidence, 1, 2, "SUSPEND", warningAt));
        when(reviews.findAllById(any())).thenReturn(evidence);
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(policy.assess(userId)).thenReturn(new ReviewModerationPolicy.Assessment(
                evidence, 1, 2, "SUSPEND", warningAt));
        when(reviews.findByRevieweeId(userId)).thenReturn(evidence);
        when(wallets.findByUserId(userId)).thenReturn(Optional.empty());

        AccountStatusUpdateRequest request = new AccountStatusUpdateRequest();
        request.setStatus(AccountStatus.SUSPENDED);
        request.setReason("Continued harmful behavior after the warning.");
        request.setReviewIds(evidence.stream().map(Review::getId).toList());
        OffsetDateTime before = OffsetDateTime.now().plusDays(6);
        service.updateUserStatus(userId, request, 4L);

        assertEquals(AccountStatus.SUSPENDED, user.getStatus());
        assertEquals(1, user.getSuspensionCount());
        assertTrue(user.getSuspendedUntil().isAfter(before));
        assertTrue(user.getSuspendedUntil().isBefore(OffsetDateTime.now().plusDays(8)));
        verify(tokens).revokeAllForUser(userId);
        verify(notifications).createNotification(
                eq(userId), eq(NotificationType.ACCOUNT_SUSPENDED), anyString(), contains("7 days"), eq("USER"), eq(userId));
    }

    @Test
    void awardsTrustedMentorBadgeWhenSimpleEligibilityRulesAreMet() {
        TestAuthContext.loginAs(adminId);
        User user = user(AccountStatus.ACTIVE);
        List<Review> positiveReviews = List.of(highReview(), highReview(), highReview(), highReview(), highReview());
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(users.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(roles.findByUserId(userId)).thenReturn(List.of(new UserRole(userId, "MENTOR")));
        when(reviews.findByRevieweeId(userId)).thenReturn(positiveReviews);
        when(sessions.countTaughtSessionsByUserId(userId)).thenReturn(5L);
        when(policy.assess(userId)).thenReturn(new ReviewModerationPolicy.Assessment(
                List.of(), 0, 0, "NONE", null));
        when(wallets.findByUserId(userId)).thenReturn(Optional.empty());

        TrustedMentorBadgeUpdateRequest request = new TrustedMentorBadgeUpdateRequest();
        request.setTrustedMentor(true);
        var response = service.updateTrustedMentorBadge(userId, request, 4L);

        assertTrue(user.getTrustedMentor());
        assertNotNull(user.getTrustedMentorAwardedAt());
        assertEquals(adminId, user.getTrustedMentorAwardedBy());
        assertTrue(response.getTrustedMentor());
        assertTrue(response.getTrustedMentorEligible());
        assertEquals(5L, response.getCompletedSessionCount());
        verify(notifications).createNotification(
                eq(userId), eq(NotificationType.SYSTEM_ALERT), eq("Trusted Mentor badge awarded"),
                contains("strong teaching record"), eq("USER"), eq(userId));
        verify(audit).logEvent(eq(adminId), eq("AWARD_TRUSTED_MENTOR_BADGE"), eq("USER"),
                eq(userId), any(), any(), any(), isNull());
    }

    @Test
    void rejectsTrustedMentorBadgeWhenMentorHasTooFewCompletedTeachingSessions() {
        TestAuthContext.loginAs(adminId);
        User user = user(AccountStatus.ACTIVE);
        when(users.findById(userId)).thenReturn(Optional.of(user));
        when(roles.findByUserId(userId)).thenReturn(List.of(new UserRole(userId, "MENTOR")));
        when(reviews.findByRevieweeId(userId))
                .thenReturn(List.of(highReview(), highReview(), highReview(), highReview(), highReview()));
        when(sessions.countTaughtSessionsByUserId(userId)).thenReturn(4L);

        TrustedMentorBadgeUpdateRequest request = new TrustedMentorBadgeUpdateRequest();
        request.setTrustedMentor(true);

        IllegalStateException failure = assertThrows(IllegalStateException.class,
                () -> service.updateTrustedMentorBadge(userId, request, 4L));
        assertTrue(failure.getMessage().contains("5 completed teaching sessions"));
        verify(users, never()).save(any());
    }

    private User user(AccountStatus status) {
        User user = new User();
        user.setId(userId);
        user.setEmail("member@example.test");
        user.setFirstName("Test");
        user.setLastName("Member");
        user.setStatus(status);
        user.setSuspensionCount(0);
        user.setVersion(4L);
        user.setCreatedAt(OffsetDateTime.now().minusMonths(1));
        user.setUpdatedAt(OffsetDateTime.now());
        return user;
    }

    private Review lowReview() {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setRevieweeId(userId);
        review.setRating(1);
        review.setModerationStatus(ReviewModerationStatus.VERIFIED);
        review.setCreatedAt(OffsetDateTime.now().minusHours(1));
        return review;
    }

    private Review highReview() {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setRevieweeId(userId);
        review.setRating(5);
        review.setModerationStatus(ReviewModerationStatus.VERIFIED);
        review.setCreatedAt(OffsetDateTime.now().minusHours(1));
        return review;
    }
}
