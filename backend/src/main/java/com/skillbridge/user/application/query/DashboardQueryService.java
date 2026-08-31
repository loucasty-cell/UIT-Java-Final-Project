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

// DashboardQueryService: Read-only aggregated owner dashboard projection
// Linkage: DashboardController GET /api/v1/me/dashboard -> DashboardQueryService -> UserRepository, WalletQueryService, UserSkillRepository, SwapSessionRepository, UserActivityLogRepository
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardQueryService {

    // Recent-activity window shown on the dashboard
    private static final int RECENT_ACTIVITY_LIMIT = 5;

    private final UserRepository userRepository;

    private final UserProfileQueryService userProfileQueryService;

    private final WalletQueryService walletQueryService;

    private final UserSkillRepository userSkillRepository;

    private final SwapSessionRepository swapSessionRepository;

    private final UserActivityLogRepository userActivityLogRepository;

    private final UserMapper userMapper;

    // Assembles the caller's dashboard: live profile + live wallet data + skill progress + engagement metrics
    public DashboardResponse getDashboard(UUID ownerId) {
        // Step 1: Load the account and its safe profile projection
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + ownerId));
        MyProfileResponse profile = userProfileQueryService.toProfileResponse(user);

        // Step 2: Source live wallet balances from the read-only wallet query service
        WalletResponse wallet = walletQueryService.getWallet(ownerId);

        // Step 3: Take the most recent immutable ledger entries for the activity feed
        List<PointTransactionResponse> recentActivity = loadRecentActivity(ownerId, RECENT_ACTIVITY_LIMIT);

        // Step 4: Compute live skill learning & teaching progress
        List<DashboardResponse.SkillProgressSummary> skillProgress = loadSkillProgress(ownerId);

        // Step 5: Compute engagement & streak metrics
        DashboardResponse.EngagementMetrics engagement = calculateEngagementMetrics(ownerId);

        return userMapper.toDashboardResponse(profile, wallet, recentActivity, skillProgress, engagement);
    }

    private DashboardResponse.EngagementMetrics calculateEngagementMetrics(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        List<UserActivityLog> activities = userActivityLogRepository.findByUserIdOrderByActivityDateDesc(userId);

        if (activities.isEmpty()) {
            // Sourced from completed sessions if no activity logs yet
            List<SwapSession> completed = swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED);
            double totalHours = completed.stream()
                    .mapToDouble(s -> (s.getDurationMinutes() != null ? s.getDurationMinutes() : 60) / 60.0)
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

        // Calculate current streak
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

        // Calculate longest streak
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
                .mapToDouble(UserActivityLog::getHoursLearned)
                .sum();

        // Calculate hours this month
        double hoursThisMonth = activities.stream()
                .filter(a -> !a.getActivityDate().isBefore(monthStart))
                .mapToDouble(UserActivityLog::getHoursLearned)
                .sum();

        OffsetDateTime lastActive = activities.get(0).getActivityDate().atStartOfDay().atOffset(ZoneOffset.UTC);

        return DashboardResponse.EngagementMetrics.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .hoursThisWeek(hoursThisWeek)
                .hoursThisMonth(hoursThisMonth)
                .lastActiveDate(lastActive)
                .build();
    }

    private List<DashboardResponse.SkillProgressSummary> loadSkillProgress(UUID userId) {
        List<UserSkill> userSkills = userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SwapSession> completedSessions = swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED);

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
                    .mapToDouble(s -> (s.getDurationMinutes() != null ? s.getDurationMinutes() : 60) / 60.0)
                    .sum();

            // Progress calculation formula: 10 sessions = 100%, minimum base progress by proficiency level
            int baseProgress = switch (skill.getLevel()) {
                case ADVANCED -> 65;
                case INTERMEDIATE -> 35;
                case BEGINNER -> 15;
            };
            int progressPercentage = Math.min(baseProgress + (sessionsCount * 10), 100);

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

    private List<PointTransactionResponse> loadRecentActivity(UUID ownerId, int limit) {
        var page = walletQueryService.getTransactions(
                ownerId,
                null,
                null,
                null,
                PageRequest.of(0, Math.max(limit, 1), Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return page.getContent();
    }
}
