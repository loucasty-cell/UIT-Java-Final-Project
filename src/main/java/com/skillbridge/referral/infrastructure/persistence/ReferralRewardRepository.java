package com.skillbridge.referral.infrastructure.persistence;

import com.skillbridge.referral.domain.entity.ReferralReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReferralRewardRepository extends JpaRepository<ReferralReward, UUID> {
    List<ReferralReward> findByReferrerIdOrderByCreatedAtDesc(UUID referrerId);
    long countByReferrerId(UUID referrerId);
}
