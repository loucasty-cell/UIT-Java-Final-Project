package com.skillbridge.shared.infrastructure.scheduling;

import com.skillbridge.auth.infrastructure.persistence.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
@Slf4j
@RequiredArgsConstructor
public class RefreshTokenCleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;

    // Runs daily at 3:00 AM UTC to prune expired refresh tokens (distributed-safe via ShedLock)
    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    @SchedulerLock(name = "refreshTokenCleanup", lockAtMostFor = "PT10M", lockAtLeastFor = "PT30S")
    @Transactional
    public void cleanupExpiredTokens() {
        try {
            log.info("Starting expired refresh token cleanup");
            refreshTokenRepository.deleteExpiredTokens(OffsetDateTime.now(ZoneOffset.UTC));
            log.info("Expired refresh token cleanup completed");
        } catch (Exception e) {
            log.error("Failed to cleanup expired refresh tokens", e);
        }
    }
}

