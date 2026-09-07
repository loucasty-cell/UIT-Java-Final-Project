package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.DisputeResolutionRequest;
import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeResolution;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.shared.error.InvalidDisputeResolutionException;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.application.command.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

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
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found with ID: " + disputeId));

        UUID currentAdminId = SecurityUtils.getCurrentUserId();
        String beforeStatus = dispute.getStatus().name();

        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            // Idempotent return if already resolved
            return adminMapper.toResponse(dispute);
        }

        SwapSession disputedSession = sessionRepository.findById(dispute.getSessionId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + dispute.getSessionId()));
        if (disputedSession.getStatus() == SwapSessionStatus.CANCELLED) {
            throw new InvalidDisputeResolutionException(
                    "Cannot resolve dispute on cancelled session: " + disputedSession.getId());
        }

        OffsetDateTime now = OffsetDateTime.now();

        // Financial & session status updates based on resolution
        if (request.getResolution() == DisputeResolution.RELEASE_TO_MENTOR
                || request.getResolution() == DisputeResolution.MARK_COMPLETED) {
            sessionRepository.findById(dispute.getSessionId()).ifPresent(session -> {
                requestRepository.findById(session.getSwapRequestId()).ifPresent(swapRequest -> {
                    if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
                        walletService.releaseHeldPoints(
                                swapRequest.getRequesterId(),
                                swapRequest.getResponderId(),
                                "SWAP_REQUEST",
                                swapRequest.getId(),
                                "DISPUTE_RELEASE:" + dispute.getId());
                        swapRequest.setPointsHeld(false);
                    }
                    swapRequest.setStatus(SwapRequestStatus.COMPLETED);
                    swapRequest.setCompletedAt(now);
                    swapRequest.setUpdatedAt(now);
                    requestRepository.save(swapRequest);
                });
                session.setStatus(SwapSessionStatus.COMPLETED);
                session.setCompletedAt(now);
                session.setUpdatedAt(now);
                sessionRepository.save(session);
            });
        } else if (request.getResolution() == DisputeResolution.REFUND_LEARNER
                || request.getResolution() == DisputeResolution.CANCEL_SWAP
                || request.getResolution() == DisputeResolution.CANCEL_NO_TRANSFER) {
            sessionRepository.findById(dispute.getSessionId()).ifPresent(session -> {
                requestRepository.findById(session.getSwapRequestId()).ifPresent(swapRequest -> {
                    if (Boolean.TRUE.equals(swapRequest.getPointsHeld())) {
                        walletService.refundHeldPoints(
                                swapRequest.getRequesterId(),
                                "SWAP_REQUEST",
                                swapRequest.getId(),
                                "DISPUTE_REFUND:" + dispute.getId());
                        swapRequest.setPointsHeld(false);
                    }
                    swapRequest.setStatus(SwapRequestStatus.CANCELLED);
                    swapRequest.setCancelledAt(now);
                    swapRequest.setUpdatedAt(now);
                    requestRepository.save(swapRequest);
                });
                session.setStatus(SwapSessionStatus.CANCELLED);
                session.setUpdatedAt(now);
                sessionRepository.save(session);
            });
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(request.getResolution());
        dispute.setResolutionNote(request.getNote());
        dispute.setResolvedBy(currentAdminId);
        dispute.setResolvedAt(now);
        dispute.setUpdatedAt(now);

        Dispute saved = disputeRepository.save(dispute);

        adminAuditService.logEvent(
                currentAdminId,
                "RESOLVE_DISPUTE",
                "DISPUTE",
                disputeId,
                "Status: " + beforeStatus,
                "Resolution: " + request.getResolution().name(),
                request.getNote(),
                null);

        return adminMapper.toResponse(saved);
    }
}
