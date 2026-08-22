package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.DisputeResolutionRequest;
import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.shared.security.SecurityUtils;
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

    public DisputeResponse resolveDispute(UUID disputeId, DisputeResolutionRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new IllegalArgumentException("Dispute not found with ID: " + disputeId));

        UUID currentAdminId = SecurityUtils.getCurrentUserId();
        String beforeStatus = dispute.getStatus().name();

        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            // Idempotent return if already resolved
            return adminMapper.toResponse(dispute);
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(request.getResolution());
        dispute.setResolutionNote(request.getNote());
        dispute.setResolvedBy(currentAdminId);
        dispute.setResolvedAt(OffsetDateTime.now());
        dispute.setUpdatedAt(OffsetDateTime.now());

        Dispute saved = disputeRepository.save(dispute);

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

        return adminMapper.toResponse(saved);
    }
}
