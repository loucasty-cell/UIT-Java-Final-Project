package com.skillbridge.milestone.application;

import com.skillbridge.milestone.domain.entity.Milestone;
import com.skillbridge.milestone.domain.entity.UserMilestone;
import com.skillbridge.milestone.infrastructure.persistence.MilestoneRepository;
import com.skillbridge.milestone.infrastructure.persistence.UserMilestoneRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MilestoneServiceTest {

    private MilestoneRepository milestoneRepository;
    private UserMilestoneRepository userMilestoneRepository;
    private SwapSessionRepository swapSessionRepository;
    private ReviewRepository reviewRepository;
    private WalletService walletService;
    private NotificationService notificationService;
    private MilestoneService milestoneService;

    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        milestoneRepository = Mockito.mock(MilestoneRepository.class);
        userMilestoneRepository = Mockito.mock(UserMilestoneRepository.class);
        swapSessionRepository = Mockito.mock(SwapSessionRepository.class);
        reviewRepository = Mockito.mock(ReviewRepository.class);
        walletService = Mockito.mock(WalletService.class);
        notificationService = Mockito.mock(NotificationService.class);

        milestoneService = new MilestoneService(
                milestoneRepository,
                userMilestoneRepository,
                swapSessionRepository,
                reviewRepository,
                walletService,
                notificationService
        );
    }

    @Test
    void awardsMilestoneWhenTargetCountIsReached() {
        Milestone m = new Milestone();
        m.setId(UUID.randomUUID());
        m.setCode("FIRST_SESSION");
        m.setTitle("First Step");
        m.setConditionType("SESSIONS_COMPLETED");
        m.setConditionValue(1);
        m.setPointsReward(5);

        when(milestoneRepository.findAll()).thenReturn(List.of(m));
        when(userMilestoneRepository.findByUserId(userId)).thenReturn(List.of());
        when(swapSessionRepository.countCompletedSessionsByUserId(userId)).thenReturn(1L);
        when(userMilestoneRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        milestoneService.checkAndAwardMilestones(userId);

        verify(walletService).creditPoints(eq(userId), eq(5), eq(PointEventType.MILESTONE_BONUS), eq("MILESTONE"), eq(m.getId()));
        verify(userMilestoneRepository).save(any(UserMilestone.class));
    }

    @Test
    void skipsAwardIfAlreadyAwarded() {
        UUID milestoneId = UUID.randomUUID();
        Milestone m = new Milestone();
        m.setId(milestoneId);
        m.setCode("FIRST_SESSION");
        m.setConditionType("SESSIONS_COMPLETED");
        m.setConditionValue(1);
        m.setPointsReward(5);

        UserMilestone existing = new UserMilestone();
        existing.setId(UUID.randomUUID());
        existing.setUserId(userId);
        existing.setMilestoneId(milestoneId);

        when(milestoneRepository.findAll()).thenReturn(List.of(m));
        when(userMilestoneRepository.findByUserId(userId)).thenReturn(List.of(existing));

        milestoneService.checkAndAwardMilestones(userId);

        verify(walletService, never()).creditPoints(any(), any(Integer.class), any(), any(), any());
    }
}
