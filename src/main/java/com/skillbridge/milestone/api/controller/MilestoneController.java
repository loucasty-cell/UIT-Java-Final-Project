package com.skillbridge.milestone.api.controller;

import com.skillbridge.milestone.api.dto.response.MilestoneProgressResponse;
import com.skillbridge.milestone.application.MilestoneService;
import com.skillbridge.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/milestones")
@RequiredArgsConstructor
@Tag(name = "Milestones & Achievements", description = "Endpoints for viewing milestone badges and progress")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping
    @Operation(summary = "Get current user's milestone badges and achievement progress")
    public ResponseEntity<List<MilestoneProgressResponse>> getMyMilestones() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(milestoneService.getMyMilestones(currentUserId));
    }
}
