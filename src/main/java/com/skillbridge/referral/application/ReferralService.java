package com.skillbridge.referral.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.referral.api.dto.response.ReferralRewardResponse;
import com.skillbridge.referral.api.dto.response.ReferralSummaryResponse;
import com.skillbridge.referral.domain.entity.ReferralReward;
import com.skillbridge.referral.infrastructure.persistence.ReferralRewardRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ReferralService {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 8;
    private static final int REFERRAL_BONUS_POINTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final ReferralRewardRepository referralRewardRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    public String getOrCreateReferralCode(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (user.getReferralCode() != null && !user.getReferralCode().isBlank()) {
            return user.getReferralCode();
        }

        String newCode = generateUniqueReferralCode();
        user.setReferralCode(newCode);
        userRepository.save(user);
        return newCode;
    }

    @Transactional(readOnly = true)
    public ReferralSummaryResponse getMyReferrals(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String code = user.getReferralCode();
        if (code == null || code.isBlank()) {
            code = getOrCreateReferralCode(userId);
        }

        List<ReferralReward> rewards = referralRewardRepository.findByReferrerIdOrderByCreatedAtDesc(userId);
        List<ReferralRewardResponse> rewardDtos = new ArrayList<>();
        int totalPoints = 0;

        for (ReferralReward r : rewards) {
            User referredUser = userRepository.findById(r.getReferredId()).orElse(null);
            String referredName = referredUser != null
                    ? (referredUser.getFirstName() + " " + referredUser.getLastName()).trim()
                    : "Referred User";

            totalPoints += r.getPointsAwarded();
            rewardDtos.add(ReferralRewardResponse.builder()
                    .id(r.getId())
                    .referredUserId(r.getReferredId())
                    .referredUserName(referredName)
                    .pointsAwarded(r.getPointsAwarded())
                    .createdAt(r.getCreatedAt())
                    .build());
        }

        return ReferralSummaryResponse.builder()
                .referralCode(code)
                .totalReferred((long) rewards.size())
                .totalPointsEarned(totalPoints)
                .rewards(rewardDtos)
                .build();
    }

    public void processReferral(User newUser, String referralCode) {
        if (referralCode == null || referralCode.trim().isEmpty()) {
            return;
        }

        String cleanedCode = referralCode.trim().toUpperCase();
        userRepository.findByReferralCode(cleanedCode).ifPresent(referrer -> {
            if (referrer.getId().equals(newUser.getId())) {
                return; // Prevent self-referral
            }

            newUser.setReferredBy(referrer.getId());
            userRepository.save(newUser);

            ReferralReward reward = new ReferralReward();
            reward.setId(UUID.randomUUID());
            reward.setReferrerId(referrer.getId());
            reward.setReferredId(newUser.getId());
            reward.setPointsAwarded(REFERRAL_BONUS_POINTS);
            reward.setCreatedAt(OffsetDateTime.now());
            referralRewardRepository.save(reward);

            walletService.creditPoints(
                    referrer.getId(),
                    REFERRAL_BONUS_POINTS,
                    PointEventType.REFERRAL_BONUS,
                    "REFERRAL",
                    newUser.getId()
            );

            notificationService.notifyUser(
                    referrer.getId(),
                    "Referral Reward",
                    "🎁 Referral reward: " + newUser.getFirstName() + " registered using your referral code! +" + REFERRAL_BONUS_POINTS + " points awarded.",
                    "REFERRAL",
                    reward.getId()
            );

            log.info("Referral bonus of {} pts awarded to referrer {} for user {}", REFERRAL_BONUS_POINTS, referrer.getId(), newUser.getId());
        });
    }

    private String generateUniqueReferralCode() {
        while (true) {
            StringBuilder sb = new StringBuilder("SB");
            for (int i = 0; i < CODE_LENGTH - 2; i++) {
                sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
            }
            String candidate = sb.toString();
            if (userRepository.findByReferralCode(candidate).isEmpty()) {
                return candidate;
            }
        }
    }
}
