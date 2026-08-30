package com.skillbridge.admin.api.controller;

import com.skillbridge.mentorapplication.api.dto.request.RejectMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.response.MentorApplicationResponse;
import com.skillbridge.mentorapplication.application.MentorApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/mentor-applications")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Mentor Applications", description = "Endpoints for reviewing and approving/declining mentor applications")
public class AdminMentorApplicationController {

    private final MentorApplicationService mentorApplicationService;

    @GetMapping
    @Operation(summary = "List all pending mentor applications")
    public ResponseEntity<List<MentorApplicationResponse>> getPendingApplications() {
        return ResponseEntity.ok(mentorApplicationService.getPendingApplications());
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve mentor application and grant MENTOR role to applicant")
    public ResponseEntity<MentorApplicationResponse> approveApplication(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(mentorApplicationService.approveApplication(id));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject mentor application with feedback notes")
    public ResponseEntity<MentorApplicationResponse> rejectApplication(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) RejectMentorApplicationRequest request
    ) {
        return ResponseEntity.ok(mentorApplicationService.rejectApplication(id, request));
    }
}
