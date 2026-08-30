package com.skillbridge.swap.api.controller;

import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.application.SwapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/swaps", "/api/v1/swaps"})
@RequiredArgsConstructor
public class SwapController {

    private final SwapService swapService;

    @PostMapping("/proposals")
    public ResponseEntity<SwapRequestResponse> createProposal(
            @Valid @RequestBody CreateSwapProposalRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(swapService.createProposal(request));
    }

    @PostMapping("/proposals/{id}/accept")
    public ResponseEntity<SwapRequestResponse> acceptProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(swapService.acceptProposal(id));
    }

    @PostMapping("/proposals/{id}/reject")
    public ResponseEntity<SwapRequestResponse> rejectProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(swapService.rejectProposal(id));
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<SwapSessionResponse> completeSwapSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(swapService.completeSwapSession(sessionId));
    }

    @GetMapping("/history/me")
    public ResponseEntity<List<SwapRequestResponse>> getSwapHistory() {
        return ResponseEntity.ok(swapService.getSwapHistory());
    }
}
