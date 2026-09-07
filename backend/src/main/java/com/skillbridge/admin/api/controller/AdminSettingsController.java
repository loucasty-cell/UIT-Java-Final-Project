package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.request.PlatformSettingsUpdateRequest;
import com.skillbridge.admin.api.dto.response.PlatformSettingsResponse;
import com.skillbridge.admin.application.command.PlatformSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// AdminSettingsController: REST controller configuring system-wide platform settings and point rewards
// Linkage: Admin UI System Settings -> AdminSettingsController -> PlatformSettingsService -> PlatformSettingRepository & AdminAuditService
@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminSettingsController {

    // Application service for reading and updating platform configuration defaults
    private final PlatformSettingsService platformSettingsService;

    // Retrieves current platform settings (registration bonus points, forum helpful points, escrow auto-release hours)
    // Linkage: GET /api/v1/admin/settings -> PlatformSettingsService.getSettings() -> PlatformSettingRepository
    @GetMapping
    public ResponseEntity<PlatformSettingsResponse> getSettings() {
        return ResponseEntity.ok(platformSettingsService.getSettings());
    }

    // Updates platform settings for future operations and writes an immutable audit record
    // Linkage: PATCH /api/v1/admin/settings -> PlatformSettingsService.updateSettings() -> PlatformSettingRepository & AdminAuditService
    @PatchMapping
    public ResponseEntity<PlatformSettingsResponse> updateSettings(
            @Valid @RequestBody PlatformSettingsUpdateRequest request
    ) {
        return ResponseEntity.ok(platformSettingsService.updateSettings(request));
    }
}
