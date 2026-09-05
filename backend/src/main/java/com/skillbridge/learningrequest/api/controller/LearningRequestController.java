package com.skillbridge.learningrequest.api.controller;

import com.skillbridge.learningrequest.api.dto.request.CreateLearningRequest;
import com.skillbridge.learningrequest.api.dto.request.AcceptLearningRequest;
import com.skillbridge.learningrequest.api.dto.request.RejectLearningRequest;
import com.skillbridge.learningrequest.api.dto.response.LearningRequestResponse;
import com.skillbridge.learningrequest.application.command.LearningRequestService;
import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-requests")
@RequiredArgsConstructor
@Tag(name = "Learning Requests", description = "Endpoints for booking, accepting, and managing session learning requests")
public class LearningRequestController {

    private final LearningRequestService learningRequestService;

    @PostMapping
    @Operation(summary = "Book a new learning session request")
    public ResponseEntity<LearningRequestResponse> createLearningRequest(@Valid @RequestBody CreateLearningRequest request) {
        LearningRequestResponse response = learningRequestService.createLearningRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List learning requests for current user (direction=INCOMING or OUTGOING)")
    public ResponseEntity<List<LearningRequestResponse>> getLearningRequests(
            @RequestParam(name = "direction", defaultValue = "OUTGOING") String direction,
            @RequestParam(name = "status", required = false) LearningRequestStatus status
    ) {
        List<LearningRequestResponse> responses = learningRequestService.getLearningRequests(direction, status);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get learning request details by ID")
    public ResponseEntity<LearningRequestResponse> getLearningRequest(@PathVariable("id") UUID id) {
        LearningRequestResponse response = learningRequestService.getLearningRequest(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Mentor accepts learning request and automatically schedules session")
    public ResponseEntity<LearningRequestResponse> acceptLearningRequest(
            @PathVariable("id") UUID id,
            @Valid @RequestBody AcceptLearningRequest request
    ) {
        LearningRequestResponse response = learningRequestService.acceptLearningRequest(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Mentor declines learning request and refunds held points")
    public ResponseEntity<LearningRequestResponse> rejectLearningRequest(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) RejectLearningRequest rejectRequest
    ) {
        LearningRequestResponse response = learningRequestService.rejectLearningRequest(id, rejectRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Learner cancels pending learning request and refunds held points")
    public ResponseEntity<LearningRequestResponse> cancelLearningRequest(
            @PathVariable("id") UUID id,
            @RequestBody(required = false) RejectLearningRequest cancelRequest
    ) {
        LearningRequestResponse response = learningRequestService.cancelLearningRequest(id, cancelRequest);
        return ResponseEntity.ok(response);
    }
}
