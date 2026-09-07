package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.request.DisputeResolutionRequest;
import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.application.command.AdminDisputeService;
import com.skillbridge.admin.application.query.AdminDisputeQueryService;
import com.skillbridge.admin.domain.model.DisputeStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// AdminDisputeController: REST controller managing learning session disputes and arbitrator resolutions
// Linkage: Admin UI Disputes -> AdminDisputeController -> AdminDisputeService & AdminDisputeQueryService -> DisputeRepository
@RestController
@RequestMapping("/api/v1/admin/disputes")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminDisputeController {

    // Command service dependency for resolving disputes with mode-valid outcomes
    private final AdminDisputeService adminDisputeService;

    // Query service dependency for listing and filtering open/resolved disputes
    private final AdminDisputeQueryService adminDisputeQueryService;

    // Retrieves paginated session disputes with optional filtering by status (OPEN, RESOLVED, REJECTED)
    // Linkage: GET /api/v1/admin/disputes -> AdminDisputeQueryService.getDisputes() -> DisputeRepository
    @GetMapping
    public ResponseEntity<Page<DisputeResponse>> getDisputes(
            @RequestParam(required = false) DisputeStatus status,
            Pageable pageable
    ) {
        return ResponseEntity.ok(adminDisputeQueryService.getDisputes(status, pageable));
    }

    // Resolves a dispute with a documented resolution (RELEASE_TO_MENTOR, REFUND_LEARNER, CANCEL_NO_TRANSFER)
    // Linkage: POST /api/v1/admin/disputes/{disputeId}/resolve -> AdminDisputeService.resolveDispute() -> DisputeRepository & AdminAuditService
    @PostMapping("/{disputeId}/resolve")
    public ResponseEntity<DisputeResponse> resolveDispute(
            @PathVariable UUID disputeId,
            @Valid @RequestBody DisputeResolutionRequest request
    ) {
        return ResponseEntity.ok(adminDisputeService.resolveDispute(disputeId, request));
    }
}
