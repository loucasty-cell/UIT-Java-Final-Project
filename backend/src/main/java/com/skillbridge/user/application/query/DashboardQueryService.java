package com.skillbridge.user.application.query;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.user.api.dto.response.DashboardResponse;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.api.mapper.UserMapper;
import com.skillbridge.user.domain.entity.UserActivityLog;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserActivityLogRepository;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import com.skillbridge.wallet.application.query.WalletQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * DashboardQueryService: Read-only aggregated owner dashboard projection
 * Assembles: profile + wallet + skill progress + engagement metrics + activity feed
 * Caching: Consider @Cacheable for high-frequency dashboard loads
 */
@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardQueryService {

    private final UserRepository userRepository;
    private final UserProfileQueryService userProfileQueryService;
    private final WalletQueryService walletQueryService;
    private final UserSkillRepository userSkillRepository;
    private final SwapSessionRepository swapSessionRepository;
    private final UserActivityLogRepository userActivityLogRepository;
    private final UserMapper userMapper;

    /**
     * Assembles the caller's complete dashboard with profile, wallet, skills, and metrics
     * 
     * @param ownerId The user ID requesting the dashboard
     * @return Complete dashboard response with all aggregated data
     * @throws IllegalArgumentException if user not found
     */
    public DashboardResponse getDashboard(UUID ownerId) {
        log.info("Loading dashboard: userId={}", ownerId);

        // Step 1: Load the account and its safe profile projection
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> {
                    log.warn("User not found for dashboard: userId={}", ownerId);
                    return new IllegalArgumentException("User not found: " + ownerId);
                });
        MyProfileResponse profile = userProfileQueryService.toProfileResponse(user);
        log.debug("Profile loaded: userId={}", ownerId);

        // Step 2: Source live wallet balances from the read-only wallet query service
        WalletResponse wallet = walletQueryService.getWallet(ownerId);
        log.debug("Wallet loaded: userId={}, balance={}", ownerId, wallet != null ? wallet.getAvailablePoints() : 0);

        // Step 3: Take the most recent immutable ledger entries for the activity feed
        List<PointTransactionResponse> recentActivity = loadRecentActivity(ownerId, DashboardConstants.RECENT_ACTIVITY_LIMIT);
        log.debug("Recent activity loaded: userId={}, count={}", ownerId, recentActivity.size());

        // Step 4: Compute live skill learning & teaching progress
        List<DashboardResponse.SkillProgressSummary> skillProgress = loadSkillProgress(ownerId);
        log.debug("Skill progress loaded: userId={}, skills={}", ownerId, skillProgress.size());

        // Step 5: Compute engagement & streak metrics
        DashboardResponse.EngagementMetrics engagement = calculateEngagementMetrics(ownerId);
        log.debug("Engagement metrics calculated: userId={}", ownerId);

        DashboardResponse dashboard = userMapper.toDashboardResponse(profile, wallet, recentActivity, skillProgress, engagement);
        log.info("Dashboard assembled successfully: userId={}", ownerId);

        return dashboard;
    }

    /**
     * Calculates engagement metrics: current streak, longest streak, hours learned
     * 
     * Streak Logic:
     * - Current streak: consecutive days with activity
     * - Longest streak: maximum consecutive days ever achieved
     * - Hours this week/month: aggregated from activity logs
     * 
     * @param userId The user ID
     * @return Engagement metrics or builder with default values if no activities
     */
    private DashboardResponse.EngagementMetrics calculateEngagementMetrics(UUID userId) {
        log.debug("Calculating engagement metrics: userId={}", userId);

        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        List<UserActivityLog> activities = userActivityLogRepository.findByUserIdOrderByActivityDateDesc(userId);

        if (activities.isEmpty()) {
            log.debug("No activity logs found: userId={}, returning defaults", userId);
            List<SwapSession> completed = swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED);
            double totalHours = completed.stream()
                    .mapToDouble(s -> (s.getDurationMinutes() != null ? s.getDurationMinutes() : DashboardConstants.DEFAULT_SESSION_DURATION_MINUTES) / 60.0)
                    .sum();
            int streak = !completed.isEmpty() ? 1 : 0;
            return DashboardResponse.EngagementMetrics.builder()
                    .currentStreak(streak)
                    .longestStreak(streak)
                    .hoursThisWeek(Math.min(totalHours, 3.5))
                    .hoursThisMonth(totalHours)
                    .lastActiveDate(OffsetDateTime.now())
                    .build();
        }

        // Calculate current streak: consecutive days from today backwards
        int currentStreak = 0;
        LocalDate checkDate = today;
        for (UserActivityLog activity : activities) {
            if (activity.getActivityDate().equals(checkDate)) {
                currentStreak++;
                checkDate = checkDate.minusDays(1);
            } else if (activity.getActivityDate().isBefore(checkDate)) {
                break;
            }
        }

        // Calculate longest streak: find maximum consecutive days
        int longestStreak = 0;
        int tempStreak = 0;
        LocalDate lastDate = null;
        for (UserActivityLog activity : activities) {
            if (lastDate == null || activity.getActivityDate().equals(lastDate.minusDays(1))) {
                tempStreak++;
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            } else {
                tempStreak = 1;
            }
            lastDate = activity.getActivityDate();
        }

        // Calculate hours this week
        double hoursThisWeek = activities.stream()
                .filter(a -> !a.getActivityDate().isBefore(weekAgo))
                .mapToDouble(activity -> activity.getHoursLearned().doubleValue())
                .sum();

        // Calculate hours this month
        double hoursThisMonth = activities.stream()
                .filter(a -> !a.getActivityDate().isBefore(monthStart))
                .mapToDouble(activity -> activity.getHoursLearned().doubleValue())
                .sum();

        OffsetDateTime lastActive = activities.get(0).getActivityDate().atStartOfDay().atOffset(ZoneOffset.UTC);

        log.debug("Engagement metrics calculated: userId={}, currentStreak={}, longestStreak={}, hoursThisWeek={}",
                userId, currentStreak, longestStreak, hoursThisWeek);

        return DashboardResponse.EngagementMetrics.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .hoursThisWeek(hoursThisWeek)
                .hoursThisMonth(hoursThisMonth)
                .lastActiveDate(lastActive)
                .build();
    }

    private List<DashboardResponse.SkillProgressSummary> loadSkillProgress(UUID userId) {
        log.debug("Loading skill progress: userId={}", userId);

        List<UserSkill> userSkills = userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SwapSession> completedSessions = swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED);

        log.debug("Found {} user skills and {} completed sessions: userId={}", 
                userSkills.size(), completedSessions.size(), userId);

        return userSkills.stream().map(skill -> {
            UUID targetSkillId = skill.getSkillId();
            String skillName = skill.getSkill() != null ? skill.getSkill().getName() : "Skill";

            // Find sessions related to this skill
            List<SwapSession> matchingSessions = completedSessions.stream()
                    .filter(s -> (s.getOfferedSkillId() != null && s.getOfferedSkillId().equals(targetSkillId))
                            || (s.getRequestedSkillId() != null && s.getRequestedSkillId().equals(targetSkillId)))
                    .toList();

            int sessionsCount = matchingSessions.size();
            double hoursLearned = matchingSessions.stream()
                    .mapToDouble(s -> (s.getDurationMinutes() != null ? s.getDurationMinutes() : DashboardConstants.DEFAULT_SESSION_DURATION_MINUTES) / 60.0)
                    .sum();

            // Progress calculation: base level progress + 10% per session, capped at 100%
            int baseProgress = switch (skill.getLevel()) {
                case ADVANCED -> DashboardConstants.PROGRESS_BASE_ADVANCED;
                case INTERMEDIATE -> DashboardConstants.PROGRESS_BASE_INTERMEDIATE;
                case BEGINNER -> DashboardConstants.PROGRESS_BASE_BEGINNER;
            };
            int progressPercentage = Math.min(
                    baseProgress + (sessionsCount * DashboardConstants.PROGRESS_INCREMENT_PER_SESSION),
                    DashboardConstants.PROGRESS_MAX_PERCENTAGE
            );

            return DashboardResponse.SkillProgressSummary.builder()
                    .skillId(skill.getId())
                    .skillName(skillName)
                    .direction(skill.getDirection() != null ? skill.getDirection().name() : "LEARN")
                    .progressPercentage(progressPercentage)
                    .hoursLearned(hoursLearned)
                    .sessionsCompleted(sessionsCount)
                    .currentLevel(skill.getLevel() != null ? skill.getLevel().name() : "BEGINNER")
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Loads recent activity transactions for the dashboard feed
     * 
     * @param ownerId The user ID
     * @param limit Maximum number of transactions to return
     * @return List of recent point transactions
     */
    private List<PointTransactionResponse> loadRecentActivity(UUID ownerId, int limit) {
        log.debug("Loading recent activity: userId={}, limit={}", ownerId, limit);

        try {
            var page = walletQueryService.getTransactions(
                    ownerId,
                    null,
                    null,
                    null,
                    PageRequest.of(0, Math.max(limit, 1), Sort.by(Sort.Direction.DESC, "createdAt"))
            );
            List<PointTransactionResponse> transactions = page.getContent();
            log.debug("Recent activity loaded: userId={}, count={}", ownerId, transactions.size());
            return transactions;
        } catch (Exception e) {
            log.warn("Failed to load recent activity: userId={}, returning empty list", ownerId, e);
            return List.of();
        }
    }
}

