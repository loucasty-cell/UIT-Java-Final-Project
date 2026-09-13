package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.request.TrustedMentorBadgeUpdateRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.dto.response.AdminUserResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.RefreshTokenRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.notification.domain.model.NotificationType;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.domain.model.ReviewModerationStatus;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminUserService {
    static final long TRUSTED_MENTOR_MIN_SESSIONS = 5;
    static final long TRUSTED_MENTOR_MIN_REVIEWS = 5;
    static final double TRUSTED_MENTOR_MIN_RATING = 4.5;
    private final AccountWarningRepository accountWarningRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewModerationPolicy moderationPolicy;
    private final NotificationService notificationService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final WalletRepository walletRepository;
    private final SwapSessionRepository swapSessionRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public AccountWarningResponse issueWarning(UUID userId, AccountWarningRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        User user = loadModeratableUser(userId, adminId);
        ReviewModerationPolicy.Assessment assessment = moderationPolicy.assess(userId);
        if (!"WARN".equals(assessment.recommendedAction())) {
            throw new IllegalStateException("A warning requires at least three published 1-2 star reviews and no previous warning");
        }
        validateEvidence(userId, request.getReviewIds(), null, ReviewModerationPolicy.WARNING_THRESHOLD);

        AccountWarning warning = new AccountWarning();
        warning.setId(UUID.randomUUID());
        warning.setUserId(userId);
        warning.setAdminId(adminId);
        warning.setReason(request.getReason());
        warning.setMessage(request.getMessage().trim());
        warning.setEvidenceReviewIds(joinIds(request.getReviewIds()));
        warning.setCreatedAt(OffsetDateTime.now());
        AccountWarning saved = accountWarningRepository.save(warning);

        AccountStatus before = user.getStatus();
        user.setStatus(AccountStatus.WARNED);
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
        notificationService.createNotification(
                userId,
                NotificationType.ACCOUNT_WARNING,
                "Important account warning",
                request.getMessage().trim(),
                "ACCOUNT_WARNING",
                saved.getId()
        );
        adminAuditService.logEvent(
                adminId,
                "ISSUE_WARNING",
                "USER",
                userId,
                "Status: " + before,
                "Status: WARNED; reviews: " + joinIds(request.getReviewIds()),
                request.getMessage().trim(),
                null
        );
        return adminMapper.toResponse(saved);
    }

    public AdminUserResponse updateUserStatus(UUID userId, AccountStatusUpdateRequest request, Long ifMatchVersion) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        User user = loadModeratableUser(userId, adminId);
        if (ifMatchVersion != null && !ifMatchVersion.equals(user.getVersion())) {
            throw new IllegalStateException("This user changed since the page loaded. Refresh and try again.");
        }
        AccountStatus before = user.getStatus();
        if (request.getStatus() == AccountStatus.SUSPENDED) {
            suspendFromVerifiedReviews(user, request);
        } else if (request.getStatus() == AccountStatus.ACTIVE) {
            user.setStatus(AccountStatus.ACTIVE);
            user.setSuspendedUntil(null);
        } else {
            throw new IllegalArgumentException("Use a review warning or temporary suspension; permanent disabling is not available here");
        }
        user.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(user);
        adminAuditService.logEvent(
                adminId,
                request.getStatus() == AccountStatus.SUSPENDED ? "TEMPORARILY_SUSPEND_USER" : "LIFT_USER_SUSPENSION",
                "USER",
                userId,
                "Status: " + before,
                "Status: " + saved.getStatus() + (saved.getSuspendedUntil() == null ? "" : "; until: " + saved.getSuspendedUntil()),
                request.getReason().trim(),
                null
        );
        return toResponse(saved);
    }

    public AdminUserResponse updateTrustedMentorBadge(
            UUID userId,
            TrustedMentorBadgeUpdateRequest request,
            Long ifMatchVersion
    ) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        User user = loadModeratableUser(userId, adminId);
        if (ifMatchVersion != null && !ifMatchVersion.equals(user.getVersion())) {
            throw new IllegalStateException("This user changed since the page loaded. Refresh and try again.");
        }

        boolean award = Boolean.TRUE.equals(request.getTrustedMentor());
        TrustedMentorAssessment assessment = assessTrustedMentor(user);
        if (award && !assessment.eligible()) {
            throw new IllegalStateException(
                    "Trusted Mentor requires an active mentor with at least 5 completed teaching sessions, "
                            + "5 published reviews, and a 4.5 average rating"
            );
        }

        boolean before = Boolean.TRUE.equals(user.getTrustedMentor());
        user.setTrustedMentor(award);
        user.setTrustedMentorAwardedAt(award ? OffsetDateTime.now() : null);
        user.setTrustedMentorAwardedBy(award ? adminId : null);
        user.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(user);

        notificationService.createNotification(
                userId,
                NotificationType.SYSTEM_ALERT,
                award ? "Trusted Mentor badge awarded" : "Trusted Mentor badge removed",
                award
                        ? "An administrator awarded you the Trusted Mentor badge for your strong teaching record."
                        : "An administrator removed your Trusted Mentor badge.",
                "USER",
                userId
        );
        adminAuditService.logEvent(
                adminId,
                award ? "AWARD_TRUSTED_MENTOR_BADGE" : "REVOKE_TRUSTED_MENTOR_BADGE",
                "USER",
                userId,
                "Trusted Mentor: " + before,
                "Trusted Mentor: " + award,
                award ? "Eligibility criteria met" : "Administrator revoked badge",
                null
        );
        return toResponse(saved);
    }

    private void suspendFromVerifiedReviews(User user, AccountStatusUpdateRequest request) {
        ReviewModerationPolicy.Assessment assessment = moderationPolicy.assess(user.getId());
        if (!"SUSPEND".equals(assessment.recommendedAction())) {
            throw new IllegalStateException("A temporary suspension requires two additional published 1-2 star reviews after a warning");
        }
        validateEvidence(
                user.getId(),
                request.getReviewIds(),
                assessment.latestEnforcementAt(),
                ReviewModerationPolicy.SUSPENSION_THRESHOLD_AFTER_WARNING
        );
        int previousSuspensions = user.getSuspensionCount() == null ? 0 : user.getSuspensionCount();
        int days = previousSuspensions == 0 ? 7 : 30;
        user.setStatus(AccountStatus.SUSPENDED);
        OffsetDateTime now = OffsetDateTime.now();
        user.setLastSuspendedAt(now);
        user.setSuspendedUntil(now.plusDays(days));
        user.setSuspensionCount(previousSuspensions + 1);
        refreshTokenRepository.revokeAllForUser(user.getId());
        notificationService.createNotification(
                user.getId(),
                NotificationType.ACCOUNT_SUSPENDED,
                "Account temporarily suspended",
                notificationMessage("Your account is suspended for " + days + " days. Reason: " + request.getReason().trim()),
                "USER",
                user.getId()
        );
    }

    private User loadModeratableUser(UUID userId, UUID adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        if (userId.equals(adminId)) throw new AccessDeniedException("Administrators cannot moderate themselves");
        boolean isAdmin = userRoleRepository.findByUserId(userId).stream()
                .anyMatch(role -> role.getRole() != null && role.getRole().replace("ROLE_", "").equalsIgnoreCase("ADMIN"));
        if (isAdmin) throw new AccessDeniedException("Administrator accounts cannot be warned or suspended");
        return user;
    }

    private void validateEvidence(UUID userId, List<UUID> reviewIds, OffsetDateTime after, int requiredCount) {
        if (reviewIds == null) throw new IllegalArgumentException("Low-review evidence is required");
        Set<UUID> uniqueIds = new HashSet<>(reviewIds);
        List<Review> evidence = reviewRepository.findAllById(uniqueIds);
        long valid = evidence.stream()
                .filter(review -> review.getRevieweeId().equals(userId))
                .filter(review -> review.getModerationStatus() != ReviewModerationStatus.DISMISSED)
                .filter(review -> review.getRating() <= ReviewModerationPolicy.LOW_RATING_MAX)
                .filter(review -> after == null || review.getCreatedAt().isAfter(after))
                .count();
        if (evidence.size() != uniqueIds.size() || valid < requiredCount) {
            throw new IllegalArgumentException("Select the required published 1-2 star reviews for this user");
        }
    }

    private AdminUserResponse toResponse(User user) {
        List<String> roles = userRoleRepository.findByUserId(user.getId()).stream()
                .map(com.skillbridge.auth.domain.entity.UserRole::getRole).toList();
        ReviewModerationPolicy.Assessment assessment = moderationPolicy.assess(user.getId());
        List<Review> publishedReviews = reviewRepository.findByRevieweeId(user.getId()).stream()
                .filter(review -> review.getModerationStatus() != ReviewModerationStatus.DISMISSED)
                .toList();
        long reviewCount = publishedReviews.size();
        double average = publishedReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        var wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        TrustedMentorAssessment trustedMentor = assessTrustedMentor(user, roles, reviewCount, average);
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .status(user.getStatus() == null ? AccountStatus.ACTIVE : user.getStatus())
                .roles(roles.isEmpty() ? List.of("USER") : roles)
                .major(user.getMajor())
                .yearOfStudy(user.getYearOfStudy())
                .warningCount(assessment.warningCount())
                .verifiedReviewCount(reviewCount)
                .verifiedLowReviewCount((long) assessment.lowReviews().size())
                .verifiedAverageRating(average)
                .recommendedAction(roles.stream().anyMatch(role -> role.toUpperCase().contains("ADMIN"))
                        ? "NONE" : assessment.recommendedAction())
                .suspendedUntil(user.getSuspendedUntil())
                .suspensionCount(user.getSuspensionCount() == null ? 0 : user.getSuspensionCount())
                .reportCount(0L)
                .completedSessionCount(trustedMentor.completedTeachingSessions())
                .trustedMentor(Boolean.TRUE.equals(user.getTrustedMentor()))
                .trustedMentorEligible(trustedMentor.eligible())
                .trustedMentorAwardedAt(user.getTrustedMentorAwardedAt())
                .availablePoints(wallet == null ? 0 : wallet.getAvailablePoints())
                .heldPoints(wallet == null ? 0 : wallet.getHeldPoints())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .version(user.getVersion())
                .build();
    }

    private TrustedMentorAssessment assessTrustedMentor(User user) {
        List<String> roles = userRoleRepository.findByUserId(user.getId()).stream()
                .map(com.skillbridge.auth.domain.entity.UserRole::getRole).toList();
        List<Review> publishedReviews = reviewRepository.findByRevieweeId(user.getId()).stream()
                .filter(review -> review.getModerationStatus() != ReviewModerationStatus.DISMISSED)
                .toList();
        double average = publishedReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return assessTrustedMentor(user, roles, publishedReviews.size(), average);
    }

    private TrustedMentorAssessment assessTrustedMentor(
            User user,
            List<String> roles,
            long publishedReviewCount,
            double averageRating
    ) {
        long completedTeachingSessions = swapSessionRepository.countTaughtSessionsByUserId(user.getId());
        boolean mentor = roles.stream().anyMatch(role -> role.replace("ROLE_", "").equalsIgnoreCase("MENTOR"));
        boolean eligible = mentor
                && user.getStatus() == AccountStatus.ACTIVE
                && completedTeachingSessions >= TRUSTED_MENTOR_MIN_SESSIONS
                && publishedReviewCount >= TRUSTED_MENTOR_MIN_REVIEWS
                && averageRating >= TRUSTED_MENTOR_MIN_RATING;
        return new TrustedMentorAssessment(eligible, completedTeachingSessions);
    }

    private record TrustedMentorAssessment(boolean eligible, long completedTeachingSessions) {
    }

    private String joinIds(List<UUID> ids) {
        return ids.stream().distinct().map(UUID::toString).collect(java.util.stream.Collectors.joining(","));
    }

    private String notificationMessage(String message) {
        return message.length() <= 500 ? message : message.substring(0, 497) + "...";
    }
}
