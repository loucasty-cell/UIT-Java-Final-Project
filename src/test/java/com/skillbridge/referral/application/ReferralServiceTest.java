package com.skillbridge.referral.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.referral.api.dto.response.ReferralSummaryResponse;
import com.skillbridge.referral.domain.entity.ReferralReward;
import com.skillbridge.referral.infrastructure.persistence.ReferralRewardRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ReferralServiceTest {

    private UserRepository userRepository;
    private ReferralRewardRepository referralRewardRepository;
    private WalletService walletService;
    private NotificationService notificationService;
    private ReferralService referralService;

    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        referralRewardRepository = Mockito.mock(ReferralRewardRepository.class);
        walletService = Mockito.mock(WalletService.class);
        notificationService = Mockito.mock(NotificationService.class);
        referralService = new ReferralService(userRepository, referralRewardRepository, walletService, notificationService);

        TestAuthContext.loginAs(userId);
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void generatesReferralCodeIfNoneExists() {
        User user = new User();
        user.setId(userId);
        user.setReferralCode(null);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.findByReferralCode(any())).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(referralRewardRepository.findByReferrerIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

        ReferralSummaryResponse response = referralService.getMyReferrals(userId);

        assertNotNull(response.getReferralCode());
        assertEquals(0L, response.getTotalReferred());
        verify(userRepository).save(user);
    }

    @Test
    void processesValidReferralAndCreditsPoints() {
        UUID referrerId = UUID.randomUUID();
        User referrer = new User();
        referrer.setId(referrerId);
        referrer.setReferralCode("SBTEST123");

        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        newUser.setFirstName("New");

        when(userRepository.findByReferralCode("SBTEST123")).thenReturn(Optional.of(referrer));
        when(referralRewardRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        referralService.processReferral(newUser, "SBTEST123");

        assertEquals(referrerId, newUser.getReferredBy());
        verify(walletService).creditPoints(eq(referrerId), eq(5), eq(PointEventType.REFERRAL_BONUS), eq("REFERRAL"), eq(newUser.getId()));
    }

    @Test
    void preventsSelfReferral() {
        User self = new User();
        self.setId(userId);
        self.setReferralCode("SBSELF123");

        when(userRepository.findByReferralCode("SBSELF123")).thenReturn(Optional.of(self));

        referralService.processReferral(self, "SBSELF123");

        verify(walletService, never()).creditPoints(any(), any(Integer.class), any(), any(), any());
    }
}
