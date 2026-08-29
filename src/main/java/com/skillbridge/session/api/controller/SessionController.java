package com.skillbridge.session.api.controller;

import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.session.api.dto.request.CreateDisputeRequest;
import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.application.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/active/me")
    public ResponseEntity<List<SessionResponse>> getActiveSwapSessions() {
        return ResponseEntity.ok(sessionService.getActiveSwapSessions());
    }

    @PostMapping("/{sessionId}/start")
    public ResponseEntity<SessionResponse> startSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.startSession(sessionId));
    }

    @PostMapping("/{sessionId}/complete")
    public ResponseEntity<SessionResponse> completeSession(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(sessionService.completeSession(sessionId));
    }

    @PatchMapping("/{sessionId}")
    public ResponseEntity<SessionResponse> updateSession(
            @PathVariable UUID sessionId,
            @Valid @RequestBody UpdateSessionRequest request
    ) {
        return ResponseEntity.ok(sessionService.updateSession(sessionId, request));
    }

    @PostMapping("/{sessionId}/dispute")
    @ResponseStatus(HttpStatus.CREATED)
    public DisputeResponse openDispute(
            @PathVariable UUID sessionId,
            @Valid @RequestBody CreateDisputeRequest request
    ) {
        return sessionService.openDispute(sessionId, request);
    }
}
