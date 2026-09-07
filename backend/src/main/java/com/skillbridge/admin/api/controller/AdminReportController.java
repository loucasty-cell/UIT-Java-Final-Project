package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.request.AdminReasonRequest;
import com.skillbridge.admin.api.dto.response.ReportResponse;
import com.skillbridge.admin.application.command.AdminReportService;
import com.skillbridge.admin.application.query.AdminReportQueryService;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// AdminReportController: REST controller managing the platform moderation queue and reported content
// Linkage: Admin UI Moderation Queue -> AdminReportController -> AdminReportService (mutations) & AdminReportQueryService (queries)
@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminReportController {

    // Command service dependency for report dismissal and content removal actions
    private final AdminReportService adminReportService;

    // Query service dependency for paginated and filtered report queries
    private final AdminReportQueryService adminReportQueryService;

    // Retrieves paginated reports with optional filtering by status (OPEN, DISMISSED, ACTIONED) and targetType
    // Linkage: GET /api/v1/admin/reports -> AdminReportQueryService.getReports() -> ReportRepository
    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportTargetType targetType,
            Pageable pageable
    ) {
        return ResponseEntity.ok(adminReportQueryService.getReports(status, targetType, pageable));
    }

    // Dismisses a user report with an administrative reason and writes an immutable audit event
    // Linkage: POST /api/v1/admin/reports/{reportId}/dismiss -> AdminReportService.dismissReport() -> ReportRepository & AdminAuditService
    @PostMapping("/{reportId}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody AdminReasonRequest request
    ) {
        return ResponseEntity.ok(adminReportService.dismissReport(reportId, request));
    }

    // Soft-deletes target reported content (e.g. forum post, comment), marks report ACTIONED, and audits the action
    // Linkage: POST /api/v1/admin/reports/{reportId}/remove-content -> AdminReportService.removeContent() -> ForumPostRepository / ForumCommentRepository & AdminAuditService
    @PostMapping("/{reportId}/remove-content")
    public ResponseEntity<ReportResponse> removeContent(
            @PathVariable UUID reportId,
            @Valid @RequestBody AdminReasonRequest request
    ) {
        return ResponseEntity.ok(adminReportService.removeContent(reportId, request));
    }
}
