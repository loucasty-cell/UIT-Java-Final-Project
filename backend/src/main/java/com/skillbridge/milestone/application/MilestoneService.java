package com.skillbridge.milestone.application;

import com.skillbridge.milestone.api.dto.request.CreateMilestoneRequest;
import com.skillbridge.milestone.api.dto.request.UpdateMilestoneRequest;
import com.skillbridge.milestone.api.dto.response.MilestoneProgressResponse;
import com.skillbridge.milestone.domain.entity.Milestone;
import com.skillbridge.milestone.domain.entity.UserMilestone;
import com.skillbridge.milestone.infrastructure.persistence.MilestoneRepository;
import com.skillbridge.milestone.infrastructure.persistence.UserMilestoneRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final UserMilestoneRepository userMilestoneRepository;
    private final SwapSessionRepository swapSessionRepository;
    private final ReviewRepository reviewRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    /**
     * Checks all unachieved milestones for the given user and awards any newly qualified milestones.
     */
    public void checkAndAwardMilestones(UUID userId) {
        if (userId == null) {
            return;
        }

        List<Milestone> allMilestones = milestoneRepository.findAll();
        Map<UUID, UserMilestone> userAchievedMap = new HashMap<>();
        userMilestoneRepository.findByUserId(userId).forEach(um -> userAchievedMap.put(um.getMilestoneId(), um));

        for (Milestone milestone : allMilestones) {
            if (userAchievedMap.containsKey(milestone.getId())) {
                continue; // Already achieved
            }

            int currentProgress = calculateProgress(userId, milestone.getConditionType());
            if (currentProgress >= milestone.getConditionValue()) {
                // Award milestone
                UserMilestone userMilestone = new UserMilestone();
                userMilestone.setId(UUID.randomUUID());
                userMilestone.setUserId(userId);
                userMilestone.setMilestoneId(milestone.getId());
                userMilestone.setPointsAwarded(milestone.getPointsReward());
                userMilestone.setAchievedAt(OffsetDateTime.now());
                userMilestoneRepository.save(userMilestone);

                // Credit points
                walletService.creditPoints(
                        userId,
                        milestone.getPointsReward(),
                        PointEventType.MILESTONE_BONUS,
                        "MILESTONE",
                        milestone.getId()
                );

                // Send notification
                notificationService.notifyUser(
                        userId,
                        "Achievement Unlocked",
                        "🏆 Achievement Unlocked: " + milestone.getTitle() + "! Awarded +" + milestone.getPointsReward() + " points.",
                        "MILESTONE",
                        milestone.getId()
                );

                log.info("Awarded milestone {} to user {}", milestone.getCode(), userId);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<MilestoneProgressResponse> getMyMilestones(UUID userId) {
        List<Milestone> allMilestones = milestoneRepository.findAll();
        Map<UUID, UserMilestone> userAchievedMap = new HashMap<>();
        userMilestoneRepository.findByUserId(userId).forEach(um -> userAchievedMap.put(um.getMilestoneId(), um));

        List<MilestoneProgressResponse> results = new ArrayList<>();
        for (Milestone m : allMilestones) {
            boolean achieved = userAchievedMap.containsKey(m.getId());
            UserMilestone um = userAchievedMap.get(m.getId());
            int currentProgress = achieved ? m.getConditionValue() : calculateProgress(userId, m.getConditionType());

            results.add(MilestoneProgressResponse.builder()
                    .id(m.getId())
                    .code(m.getCode())
                    .title(m.getTitle())
                    .description(m.getDescription())
                    .conditionType(m.getConditionType())
                    .conditionValue(m.getConditionValue())
                    .currentProgress(Math.min(currentProgress, m.getConditionValue()))
                    .pointsReward(m.getPointsReward())
                    .icon(m.getIcon())
                    .achieved(achieved)
                    .achievedAt(um != null ? um.getAchievedAt() : null)
                    .build());
        }

        return results;
    }

    private int calculateProgress(UUID userId, String conditionType) {
        if (conditionType == null) {
            return 0;
        }
        return switch (conditionType.toUpperCase()) {
            case "SESSIONS_COMPLETED" -> (int) swapSessionRepository.countCompletedSessionsByUserId(userId);
            case "SESSIONS_TAUGHT" -> (int) swapSessionRepository.countTaughtSessionsByUserId(userId);
            case "REVIEWS_GIVEN" -> (int) reviewRepository.countByReviewerId(userId);
            case "REVIEWS_RECEIVED" -> (int) reviewRepository.countByRevieweeId(userId);
            case "SKILL_SWAPS_COMPLETED" -> (int) swapSessionRepository.countCompletedSwapsByUserId(userId);
            case "VOLUNTEER_SESSIONS" -> (int) swapSessionRepository.countVolunteerSessionsByUserId(userId);
            default -> 0;
        };
    }

    @Transactional(readOnly = true)
    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    public Milestone createMilestone(CreateMilestoneRequest request) {
        if (milestoneRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Milestone code already exists: " + request.getCode());
        }

        Milestone milestone = new Milestone();
        milestone.setId(UUID.randomUUID());
        milestone.setCode(request.getCode());
        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setConditionType(request.getConditionType());
        milestone.setConditionValue(request.getConditionValue());
        milestone.setPointsReward(request.getPointsReward());
        milestone.setIcon(request.getIcon());
        milestone.setCreatedAt(OffsetDateTime.now());

        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestone(UUID id, UpdateMilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + id));

        if (request.getTitle() != null) milestone.setTitle(request.getTitle());
        if (request.getDescription() != null) milestone.setDescription(request.getDescription());
        if (request.getConditionValue() != null) milestone.setConditionValue(request.getConditionValue());
        if (request.getPointsReward() != null) milestone.setPointsReward(request.getPointsReward());
        if (request.getIcon() != null) milestone.setIcon(request.getIcon());

        return milestoneRepository.save(milestone);
    }
}
