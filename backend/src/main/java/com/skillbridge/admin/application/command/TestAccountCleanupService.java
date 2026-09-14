package com.skillbridge.admin.application.command;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Removes synthetic presentation/test accounts only. This deliberately is not
 * a general-purpose account deletion service: production accounts are rejected
 * before any cleanup SQL runs.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class TestAccountCleanupService {
    private static final String TEST_EMAIL_SUFFIX = "@skillbridge.test";
    /** Legacy seed accounts used only for demonstrations; normal @skillbridge.edu users are never removable here. */
    private static final Set<String> LEGACY_DEMO_EMAILS = Set.of(
            "learner.demo@skillbridge.edu",
            "instructor.demo@skillbridge.edu"
    );

    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AdminAuditService adminAuditService;

    public void deleteTestAccount(UUID userId) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        String email = user.getEmail() == null ? "" : user.getEmail().toLowerCase(Locale.ROOT);
        if (!isRemovableDemoEmail(email)) {
            throw new AccessDeniedException("Only registered demo accounts can be deleted from the admin dashboard");
        }
        if (userId.equals(adminId)) {
            throw new AccessDeniedException("You cannot delete the account currently signed in as administrator");
        }

        createCleanupTables(userId);
        deleteDependentRecords();
        jdbcTemplate.update("DELETE FROM users WHERE id IN (SELECT id FROM cleanup_users)");
        adminAuditService.logEvent(
                adminId,
                "DELETE_DEMO_ACCOUNT",
                "USER",
                userId,
                "Demo account: " + user.getEmail(),
                "Deleted with its linked demo records",
                "Admin dashboard demo-account cleanup",
                null
        );
    }

    private boolean isRemovableDemoEmail(String email) {
        return email.endsWith(TEST_EMAIL_SUFFIX) || LEGACY_DEMO_EMAILS.contains(email);
    }

    private void createCleanupTables(UUID userId) {
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_users (id UUID PRIMARY KEY) ON COMMIT DROP");
        jdbcTemplate.update("INSERT INTO cleanup_users (id) VALUES (?)", userId);
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_offerings ON COMMIT DROP AS "
                + "SELECT id FROM mentor_offerings WHERE mentor_id IN (SELECT id FROM cleanup_users)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_forum_posts ON COMMIT DROP AS "
                + "SELECT id FROM forum_posts WHERE author_id IN (SELECT id FROM cleanup_users)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_needs ON COMMIT DROP AS "
                + "SELECT id FROM learning_needs WHERE learner_id IN (SELECT id FROM cleanup_users)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_need_offers ON COMMIT DROP AS "
                + "SELECT id FROM learning_need_offers WHERE teacher_id IN (SELECT id FROM cleanup_users) "
                + "OR learning_need_id IN (SELECT id FROM cleanup_needs)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_swap_requests ON COMMIT DROP AS "
                + "SELECT id FROM swap_requests WHERE requester_id IN (SELECT id FROM cleanup_users) "
                + "OR responder_id IN (SELECT id FROM cleanup_users)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_sessions ON COMMIT DROP AS "
                + "SELECT id FROM swap_sessions WHERE requester_id IN (SELECT id FROM cleanup_users) "
                + "OR responder_id IN (SELECT id FROM cleanup_users) "
                + "OR swap_request_id IN (SELECT id FROM cleanup_swap_requests)");
        jdbcTemplate.execute("CREATE TEMP TABLE cleanup_requests ON COMMIT DROP AS "
                + "SELECT id FROM learning_requests WHERE learner_id IN (SELECT id FROM cleanup_users) "
                + "OR mentor_id IN (SELECT id FROM cleanup_users) "
                + "OR mentor_offering_id IN (SELECT id FROM cleanup_offerings) "
                + "OR source_forum_post_id IN (SELECT id FROM cleanup_forum_posts) "
                + "OR learning_need_offer_id IN (SELECT id FROM cleanup_need_offers) "
                + "OR session_id IN (SELECT id FROM cleanup_sessions)");
    }

    private void deleteDependentRecords() {
        execute(
                "DELETE FROM reviews WHERE reviewer_id IN (SELECT id FROM cleanup_users) "
                        + "OR reviewee_id IN (SELECT id FROM cleanup_users) "
                        + "OR reviewed_by IN (SELECT id FROM cleanup_users) "
                        + "OR session_id IN (SELECT id FROM cleanup_sessions)",
                "DELETE FROM session_confirmations WHERE confirmed_by IN (SELECT id FROM cleanup_users) "
                        + "OR session_id IN (SELECT id FROM cleanup_sessions)",
                "DELETE FROM disputes WHERE opened_by IN (SELECT id FROM cleanup_users) "
                        + "OR session_id IN (SELECT id FROM cleanup_sessions)",
                "DELETE FROM reports WHERE reporter_id IN (SELECT id FROM cleanup_users) "
                        + "OR target_id IN (SELECT id FROM cleanup_requests UNION SELECT id FROM cleanup_sessions "
                        + "UNION SELECT id FROM cleanup_swap_requests UNION SELECT id FROM cleanup_forum_posts)",
                "DELETE FROM notifications WHERE user_id IN (SELECT id FROM cleanup_users) "
                        + "OR reference_id IN (SELECT id FROM cleanup_requests UNION SELECT id FROM cleanup_sessions "
                        + "UNION SELECT id FROM cleanup_swap_requests UNION SELECT id FROM cleanup_forum_posts)",
                "DELETE FROM learning_requests WHERE id IN (SELECT id FROM cleanup_requests)",
                "DELETE FROM escrows WHERE learner_id IN (SELECT id FROM cleanup_users) "
                        + "OR mentor_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM learning_need_offers WHERE id IN (SELECT id FROM cleanup_need_offers)",
                "DELETE FROM learning_needs WHERE id IN (SELECT id FROM cleanup_needs)",
                "DELETE FROM swap_sessions WHERE id IN (SELECT id FROM cleanup_sessions)",
                "DELETE FROM swap_requests WHERE id IN (SELECT id FROM cleanup_swap_requests)",
                "DELETE FROM mentor_offerings WHERE id IN (SELECT id FROM cleanup_offerings)",
                "DELETE FROM forum_comments WHERE author_id IN (SELECT id FROM cleanup_users) "
                        + "OR post_id IN (SELECT id FROM cleanup_forum_posts)",
                "DELETE FROM forum_likes WHERE user_id IN (SELECT id FROM cleanup_users) "
                        + "OR post_id IN (SELECT id FROM cleanup_forum_posts)",
                "DELETE FROM forum_posts WHERE id IN (SELECT id FROM cleanup_forum_posts)",
                "DELETE FROM user_milestones WHERE user_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM skill_progress WHERE user_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM watchlist_items WHERE user_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM account_warnings WHERE user_id IN (SELECT id FROM cleanup_users) "
                        + "OR admin_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM referral_rewards WHERE referrer_id IN (SELECT id FROM cleanup_users) "
                        + "OR referred_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM admin_audit_events WHERE actor_id IN (SELECT id FROM cleanup_users)",
                "UPDATE mentor_applications SET reviewed_by = NULL WHERE reviewed_by IN (SELECT id FROM cleanup_users)",
                "DELETE FROM mentor_applications WHERE user_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM point_ledger WHERE user_id IN (SELECT id FROM cleanup_users)",
                "DELETE FROM wallets WHERE user_id IN (SELECT id FROM cleanup_users)",
                "UPDATE users SET referred_by = NULL WHERE referred_by IN (SELECT id FROM cleanup_users)"
        );
        jdbcTemplate.execute("UPDATE forum_posts SET like_count = (SELECT count(*) FROM forum_likes "
                + "WHERE forum_likes.post_id = forum_posts.id), comment_count = (SELECT count(*) FROM forum_comments "
                + "WHERE forum_comments.post_id = forum_posts.id)");
    }

    private void execute(String... statements) {
        for (String statement : statements) {
            jdbcTemplate.update(statement);
        }
    }
}
