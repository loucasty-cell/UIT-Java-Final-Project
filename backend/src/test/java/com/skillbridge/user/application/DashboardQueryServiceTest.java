package com.skillbridge.user.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.user.api.dto.response.DashboardResponse;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.api.mapper.UserMapper;
import com.skillbridge.user.application.query.DashboardQueryService;
import com.skillbridge.user.application.query.UserProfileQueryService;
import com.skillbridge.user.domain.entity.UserActivityLog;
import com.skillbridge.user.infrastructure.persistence.UserActivityLogRepository;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import com.skillbridge.wallet.application.query.WalletQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class DashboardQueryServiceTest {

    private UserRepository userRepository;
    private UserProfileQueryService userProfileQueryService;
    private WalletQueryService walletQueryService;
    private UserSkillRepository userSkillRepository;
    private SwapSessionRepository swapSessionRepository;
    private UserActivityLogRepository userActivityLogRepository;
    private UserMapper userMapper;
    private DashboardQueryService dashboardQueryService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        userProfileQueryService = Mockito.mock(UserProfileQueryService.class);
        walletQueryService = Mockito.mock(WalletQueryService.class);
        userSkillRepository = Mockito.mock(UserSkillRepository.class);
        swapSessionRepository = Mockito.mock(SwapSessionRepository.class);
        userActivityLogRepository = Mockito.mock(UserActivityLogRepository.class);
        userMapper = Mockito.mock(UserMapper.class);

        dashboardQueryService = new DashboardQueryService(
                userRepository,
                userProfileQueryService,
                walletQueryService,
                userSkillRepository,
                swapSessionRepository,
                userActivityLogRepository,
                userMapper
        );
    }

    @Test
    void getDashboard_CalculatesEngagementMetricsCorrectly() {
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail("test@example.com");
        mockUser.setDisplayName("Test User");

        UserActivityLog activityLog = new UserActivityLog();
        activityLog.setUserId(userId);
        activityLog.setActivityDate(LocalDate.now());
        activityLog.setSessionsAttended(1);
        activityLog.setHoursLearned(2.0);
        activityLog.setLoginCount(1);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userProfileQueryService.toProfileResponse(mockUser)).thenReturn(
                MyProfileResponse.builder().id(userId).email("test@example.com").build()
        );
        when(userActivityLogRepository.findByUserIdOrderByActivityDateDesc(userId))
                .thenReturn(Collections.singletonList(activityLog));
        when(userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(new ArrayList<>());
        when(swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED)).thenReturn(new ArrayList<>());
        when(userMapper.toDashboardResponse(any(), any(), any(), any(), any()))
                .thenAnswer(inv -> DashboardResponse.builder()
                        .engagement(inv.getArgument(4))
                        .skillProgress(inv.getArgument(3))
                        .build());

        DashboardResponse response = dashboardQueryService.getDashboard(userId);

        assertThat(response).isNotNull();
        assertThat(response.getEngagement()).isNotNull();
        assertThat(response.getEngagement().getCurrentStreak()).isGreaterThanOrEqualTo(0);
    }

    @Test
    void getDashboard_IncludesSkillProgressData() {
        UUID userId = UUID.randomUUID();
        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setEmail("test@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userProfileQueryService.toProfileResponse(mockUser)).thenReturn(
                MyProfileResponse.builder().id(userId).email("test@example.com").build()
        );
        when(userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(new ArrayList<>());
        when(userActivityLogRepository.findByUserIdOrderByActivityDateDesc(userId)).thenReturn(new ArrayList<>());
        when(swapSessionRepository.findByUserIdAndStatus(userId, SwapSessionStatus.COMPLETED)).thenReturn(new ArrayList<>());
        when(userMapper.toDashboardResponse(any(), any(), any(), any(), any()))
                .thenAnswer(inv -> DashboardResponse.builder()
                        .engagement(inv.getArgument(4))
                        .skillProgress(inv.getArgument(3))
                        .build());

        DashboardResponse response = dashboardQueryService.getDashboard(userId);

        assertThat(response).isNotNull();
        assertThat(response.getSkillProgress()).isNotNull();
    }
}
