package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.DisputeResolutionRequest;
import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeResolution;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.shared.error.InvalidDisputeResolutionException;
import com.skillbridge.shared.error.ApiException;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * AdminDisputeService: Handles dispute resolution with financial operations
 * Responsibilities: Validate resolutions, execute financial transactions, audit actions
 * Security: All operations require ADMIN role (enforced by controller)
 */
@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class AdminDisputeService {

    private final DisputeRepository disputeRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;
    private final SwapSessionRepository sessionRepository;
    private final SwapRequestRepository requestRepository;
    private final WalletService walletService;

    public DisputeResponse resolveDispute(UUID disputeId, DisputeResolutionRequest request) {
        // 1. Input validation
        Objects.requireNonNull(disputeId, "Dispute ID must not be null");
        Objects.requireNonNull(request, "Resolution request must not be null");
        Objects.requireNonNull(request.getResolution(), "Resolution must not be null");

        log.info("Resolving dispute: disputeId={}, resolution={}", disputeId, request.getResolution());

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> {
                    log.warn("Dispute not found: disputeId={}", disputeId);
                    return new IllegalArgumentException("Dispute not found with ID: " + disputeId);
                });

        UUID currentAdminId = SecurityUtils.getCurrentUserId();
        String beforeStatus = dispute.getStatus().name();

        // 2. Idempotency check
        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            log.info("Dispute already resolved (idempotent): disputeId={}, resolution={}", 
                    disputeId, dispute.getResolution());
            return adminMapper.toResponse(dispute);
        }

        log.debug("Dispute loaded: disputeId={}, status={}", disputeId, dispute.getStatus());

        // 3. Validate business rules before making changes
        try {
            validateResolutionRequest(dispute, request);
        } catch (InvalidDisputeResolutionException e) {
            log.warn("Resolution validation failed: disputeId={}, reason={}", disputeId, e.getMessage());
            throw e;
        }

        OffsetDateTime now = OffsetDateTime.now();

        // 4. Execute financial operations
        try {
            processFinancialResolution(dispute, request, now);
            log.info("Financial resolution processed: disputeId={}", disputeId);
        } catch (Exception e) {
            log.error("Wallet operation failed: disputeId={}", disputeId, e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "WALLET_ERROR",
                    "Failed to process financial resolution: " + e.getMessage());
        }

        // 5. Update dispute status
        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(request.getResolution());
        dispute.setResolutionNote(request.getNote());
        dispute.setResolvedBy(currentAdminId);
        dispute.setResolvedAt(now);
        dispute.setUpdatedAt(now);

        Dispute saved = disputeRepository.save(dispute);
        log.debug("Dispute saved: disputeId={}", disputeId);

        // 6. Audit logging
        try {
            adminAuditService.logEvent(
                    currentAdminId,
                    "RESOLVE_DISPUTE",
                    "DISPUTE",
                    disputeId,
                    "Status: " + beforeStatus,
                    "Resolution: " + request.getResolution().name(),
                    request.getNote(),
                    null
            );
            log.info("Dispute resolution audited: disputeId={}", disputeId);
        } catch (Exception e) {
            log.warn("Failed to audit dispute resolution: disputeId={}", disputeId, e);
        }

        log.info("Dispute resolved successfully: disputeId={}", disputeId);
        return adminMapper.toResponse(saved);
    }

    private void validateResolutionRequest(Dispute dispute, DisputeResolutionRequest request) {
        log.debug("Validating resolution: disputeId={}", dispute.getId());

        SwapSession session = sessionRepository.findById(dispute.getSessionId())
                .orElseThrow(() -> {
                    log.error("Session not found: sessionId={}", dispute.getSessionId());
                    return new IllegalArgumentException("Session not found: " + dispute.getSessionId());
                });

        if (session.getStatus() == SwapSessionStatus.CANCELLED) {
            log.warn("Cannot resolve dispute on cancelled session: sessionId={}", session.getId());
            throw new InvalidDisputeResolutionException(
                    "Cannot resolve dispute on cancelled session: " + session.getId());
        }

        DisputeResolution resolution = request.getResolution();
        if (resolution == DisputeResolution.RELEASE_TO_MENTOR && 
                session.getStatus() == SwapSessionStatus.CANCELLED) {
            log.warn("Cannot release to mentor on cancelled session: sessionId={}", session.getId());
            throw new InvalidDisputeResolutionException("Cannot release to mentor on cancelled session");
        }

        log.debug("Validation passed: disputeId={}", dispute.getId());
    }

    private void processFinancialResolution(Dispute dispute, DisputeResolutionRequest request, OffsetDateTime now) 
            throws Exception {
        DisputeResolution resolution = request.getResolution();

        if (resolution == DisputeResolution.RELEASE_TO_MENTOR) {
            processReleaseToMentor(dispute, now);
        } else if (resolution == DisputeResolution.REFUND_LEARNER
                || resolution == DisputeResolution.CANCEL_SWAP
                || resolution == DisputeResolution.CANCEL_NO_TRANSFER) {
            processRefundToLearner(dispute, now);
        }
    }

    private void processReleaseToMentor(Dispute dispute, OffsetDateTime now) {
        log.debug("Processing release to mentor: disputeId={}", dispute.getId());

        sessionRepository.findById(dispute.getSessionId()).ifPresent(session -> {
            requestRepository.findById(session.getSwapRequestId()).ifPresent(swapRequest -> {
                if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
                    log.info("Releasing points to mentor: swapRequestId={}", swapRequest.getId());
                    walletService.releaseHeldPoints(
                            swapRequest.getRequesterId(),
                            swapRequest.getResponderId(),
                            DisputeConstants.REFERENCE_TYPE_SWAP_REQUEST,
                            swapRequest.getId(),
                            DisputeConstants.IDEMPOTENCY_PREFIX_RELEASE + dispute.getId()
                    );

                    swapRequest.setPointsHeld(false);
                    swapRequest.setStatus(SwapRequestStatus.COMPLETED);
                    swapRequest.setCompletedAt(now);
                    swapRequest.setUpdatedAt(now);
                    requestRepository.save(swapRequest);
                    log.debug("Swap marked completed: swapRequestId={}", swapRequest.getId());
                }
            });

            session.setStatus(SwapSessionStatus.COMPLETED);
            session.setCompletedAt(now);
            session.setUpdatedAt(now);
            sessionRepository.save(session);
            log.debug("Session marked completed: sessionId={}", session.getId());
        });
    }

    private void processRefundToLearner(Dispute dispute, OffsetDateTime now) {
        log.debug("Processing refund to learner: disputeId={}", dispute.getId());

        sessionRepository.findById(dispute.getSessionId()).ifPresent(session -> {
            requestRepository.findById(session.getSwapRequestId()).ifPresent(swapRequest -> {
                if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
                    log.info("Refunding points to learner: swapRequestId={}", swapRequest.getId());
                    walletService.refundHeldPoints(
                            swapRequest.getRequesterId(),
                            DisputeConstants.REFERENCE_TYPE_SWAP_REQUEST,
                            swapRequest.getId(),
                            DisputeConstants.IDEMPOTENCY_PREFIX_REFUND + dispute.getId()
                    );

                    swapRequest.setPointsHeld(false);
                    swapRequest.setStatus(SwapRequestStatus.CANCELLED);
                    swapRequest.setCancelledAt(now);
                    swapRequest.setUpdatedAt(now);
                    requestRepository.save(swapRequest);
                    log.debug("Swap marked cancelled: swapRequestId={}", swapRequest.getId());
                }
            });

            session.setStatus(SwapSessionStatus.CANCELLED);
            session.setUpdatedAt(now);
            sessionRepository.save(session);
            log.debug("Session marked cancelled: sessionId={}", session.getId());
        });
    }
}

