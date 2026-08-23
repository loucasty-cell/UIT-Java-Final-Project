package com.skillbridge.request.api.controller;

import com.skillbridge.request.api.dto.request.CreateRequestProposalRequest;
import com.skillbridge.request.api.dto.response.RequestProposalResponse;
import com.skillbridge.request.application.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:8081")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping("/swaps")
    public ResponseEntity<RequestProposalResponse> createSwapProposal(
            @Valid @RequestBody CreateRequestProposalRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createSwapProposal(request));
    }

    @PostMapping("/swaps/{id}/accept")
    public ResponseEntity<RequestProposalResponse> acceptSwapProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.acceptSwapProposal(id));
    }

    @PostMapping("/swaps/{id}/reject")
    public ResponseEntity<RequestProposalResponse> rejectSwapProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.rejectSwapProposal(id));
    }

    @PostMapping("/swaps/{id}/cancel")
    public ResponseEntity<RequestProposalResponse> cancelSwapProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(requestService.cancelSwapProposal(id));
    }

    @GetMapping("/swaps/history/users/{userId}")
    public ResponseEntity<List<RequestProposalResponse>> getSwapHistory(@PathVariable UUID userId) {
        return ResponseEntity.ok(requestService.getSwapHistory(userId));
    }

    @GetMapping("/swaps/pending/responders/{responderId}")
    public ResponseEntity<List<RequestProposalResponse>> getPendingSwapProposalsForResponder(
            @PathVariable UUID responderId
    ) {
        return ResponseEntity.ok(requestService.getPendingSwapProposalsForResponder(responderId));
    }
}
