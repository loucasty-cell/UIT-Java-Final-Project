package com.skillbridge.mentorapplication.api.controller;

import com.skillbridge.mentorapplication.api.dto.request.SubmitMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.response.MentorApplicationResponse;
import com.skillbridge.mentorapplication.application.MentorApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me/mentor-application")
@RequiredArgsConstructor
@Tag(name = "Mentor Application", description = "Endpoints for submitting and checking mentor status application")
public class MentorApplicationController {

    private final MentorApplicationService mentorApplicationService;

    @PostMapping
    @Operation(summary = "Submit an application to become a SkillBridge mentor")
    public ResponseEntity<MentorApplicationResponse> submitApplication(@Valid @RequestBody SubmitMentorApplicationRequest request) {
        MentorApplicationResponse response = mentorApplicationService.submitApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Check status of current user's mentor application")
    public ResponseEntity<MentorApplicationResponse> getMyApplication() {
        MentorApplicationResponse response = mentorApplicationService.getMyApplication();
        return ResponseEntity.ok(response);
    }
}
