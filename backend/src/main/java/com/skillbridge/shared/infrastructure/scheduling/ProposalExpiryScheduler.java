package com.skillbridge.shared.infrastructure.scheduling;

import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
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
public class ProposalExpiryScheduler {

    private static final int EXPIRY_DAYS = 7;

    private final SwapRequestRepository requestRepository;
    private final SwapService swapService;

    // Runs daily at 2:00 AM UTC to cancel stale proposals older than 7 days (ShedLock)
    @Scheduled(cron = "0 0 2 * * *", zone = "UTC")
    @SchedulerLock(name = "proposalExpiry", lockAtMostFor = "PT10M", lockAtLeastFor = "PT30S")
    @Transactional
    public void processExpiredProposals() {
        OffsetDateTime threshold = OffsetDateTime.now(ZoneOffset.UTC).minusDays(EXPIRY_DAYS);
        List<SwapRequest> staleProposals = requestRepository.findByStatusAndCreatedAtBefore(
                SwapRequestStatus.PENDING,
                threshold
        );

        for (SwapRequest request : staleProposals) {
            try {
                log.info("Expiring stale swap proposal: {}", request.getId());
                swapService.cancelProposal(request.getId());
            } catch (Exception e) {
                log.error("Failed to expire swap proposal: {}", request.getId(), e);
            }
        }
    }
}

