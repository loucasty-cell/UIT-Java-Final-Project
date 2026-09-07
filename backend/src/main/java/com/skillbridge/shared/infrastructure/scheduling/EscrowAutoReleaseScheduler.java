package com.skillbridge.shared.infrastructure.scheduling;

import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class EscrowAutoReleaseScheduler {

    private final SwapSessionRepository sessionRepository;
    private final SwapService swapService;

    // Runs every 15 minutes UTC to auto-release escrows whose deadline has passed (ShedLock)
    @Scheduled(cron = "0 */15 * * * *", zone = "UTC")
    @SchedulerLock(name = "escrowAutoRelease", lockAtMostFor = "PT5M", lockAtLeastFor = "PT20S")
    @Transactional
    public void processAutoReleases() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        List<SwapSession> eligibleSessions = sessionRepository.findSessionsEligibleForAutoRelease(
                List.of(SwapSessionStatus.ACCEPTED, SwapSessionStatus.STARTED, SwapSessionStatus.SCHEDULED, SwapSessionStatus.AWAITING_CONFIRMATION),
                now
        );

        for (SwapSession session : eligibleSessions) {
            try {
                log.info("Auto-releasing escrow for session: {}", session.getId());
                swapService.completeSwapSession(session.getId());
            } catch (Exception e) {
                log.error("Failed to auto-release escrow for session: {}", session.getId(), e);
            }
        }
    }
}

