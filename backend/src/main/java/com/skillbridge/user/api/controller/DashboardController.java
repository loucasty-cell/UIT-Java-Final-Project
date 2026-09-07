package com.skillbridge.user.api.controller;

import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.user.api.dto.response.DashboardResponse;
import com.skillbridge.user.application.query.DashboardQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

// DashboardController: Exposes the owner-only aggregated dashboard endpoint
// Linkage: GET /api/v1/me/dashboard -> SecurityUtils (JWT subject) -> DashboardQueryService
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardQueryService dashboardQueryService;

    // Returns the caller's dashboard projection with live profile and wallet data
    // Linkage: GET /api/v1/me/dashboard -> DashboardQueryService.getDashboard() -> DashboardResponse
    @GetMapping("/me/dashboard")
    public ResponseEntity<DashboardResponse> getMyDashboard() {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(dashboardQueryService.getDashboard(ownerId));
    }
}
