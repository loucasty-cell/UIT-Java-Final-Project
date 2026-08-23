package com.skillbridge.session.api.controller;

import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.application.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:8081")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping("/active/users/{userId}")
    public ResponseEntity<List<SessionResponse>> getActiveSwapSessions(@PathVariable UUID userId) {
        return ResponseEntity.ok(sessionService.getActiveSwapSessions(userId));
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
}
