package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.response.AdminDashboardResponse;
import com.skillbridge.admin.application.query.AdminDashboardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// AdminDashboardController: REST controller providing administrative overview and platform health statistics
// Linkage: GET /api/v1/admin/dashboard -> AdminDashboardQueryService -> ReportRepository & DisputeRepository
@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminDashboardController {

    // Query service dependency to calculate platform aggregated metrics
    private final AdminDashboardQueryService adminDashboardQueryService;

    // Retrieves high-level dashboard metrics (total users, escrow points, open reports, active disputes, sessions)
    // Linkage: Invoked by Admin portal dashboard view
    @GetMapping
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardQueryService.getDashboardStats());
    }
}
