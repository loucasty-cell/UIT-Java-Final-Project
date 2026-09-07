package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.response.AdminAuditEventResponse;
import com.skillbridge.admin.application.query.AdminAuditQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// AdminAuditController: REST controller exposing immutable audit logs for all administrative actions
// Linkage: Admin UI Audit Log -> AdminAuditController -> AdminAuditQueryService -> AdminAuditEventRepository
@RestController
@RequestMapping("/api/v1/admin/audit-events")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminAuditController {

    // Query service dependency to search and paginate immutable audit log events
    private final AdminAuditQueryService adminAuditQueryService;

    // Retrieves paginated audit events with optional filtering by actorId and targetType
    // Linkage: GET /api/v1/admin/audit-events -> AdminAuditQueryService.getAuditEvents() -> AdminAuditEventRepository
    @GetMapping
    public ResponseEntity<Page<AdminAuditEventResponse>> getAuditEvents(
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String targetType,
            Pageable pageable
    ) {
        return ResponseEntity.ok(adminAuditQueryService.getAuditEvents(actorId, targetType, pageable));
    }
}
