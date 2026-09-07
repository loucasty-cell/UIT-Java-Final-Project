package com.skillbridge.admin.api.controller;

import com.skillbridge.milestone.api.dto.request.CreateMilestoneRequest;
import com.skillbridge.milestone.api.dto.request.UpdateMilestoneRequest;
import com.skillbridge.milestone.application.MilestoneService;
import com.skillbridge.milestone.domain.entity.Milestone;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/milestones")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Milestones", description = "Endpoints for managing milestone achievements and point rules")
public class AdminMilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping
    @Operation(summary = "List all platform milestones")
    public ResponseEntity<List<Milestone>> getAllMilestones() {
        return ResponseEntity.ok(milestoneService.getAllMilestones());
    }

    @PostMapping
    @Operation(summary = "Create a new platform milestone")
    public ResponseEntity<Milestone> createMilestone(@Valid @RequestBody CreateMilestoneRequest request) {
        Milestone milestone = milestoneService.createMilestone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(milestone);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing platform milestone")
    public ResponseEntity<Milestone> updateMilestone(
            @PathVariable("id") UUID id,
            @RequestBody UpdateMilestoneRequest request
    ) {
        Milestone milestone = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(milestone);
    }
}
