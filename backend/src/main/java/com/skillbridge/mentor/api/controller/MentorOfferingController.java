package com.skillbridge.mentor.api.controller;

import com.skillbridge.mentor.api.dto.request.MentorOfferingCreateRequest;
import com.skillbridge.mentor.api.dto.request.MentorOfferingUpdateRequest;
import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.application.command.MentorOfferingService;
import com.skillbridge.mentor.application.query.MentorOfferingQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/mentor-offerings")
@RequiredArgsConstructor
public class MentorOfferingController {
    private final MentorOfferingService offeringService;
    private final MentorOfferingQueryService offeringQueryService;

    @GetMapping
    public ResponseEntity<Page<MentorOfferingResponse>> getMyOfferings(Pageable pageable) {
        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(offeringQueryService.getOfferings(currentUserId, pageable));
    }

    @PostMapping
    public ResponseEntity<MentorOfferingResponse> createOffering(@Valid @RequestBody MentorOfferingCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(offeringService.createOffering(request));
    }

    @PatchMapping("/{offeringId}")
    public ResponseEntity<MentorOfferingResponse> updateOffering(@PathVariable UUID offeringId, @Valid @RequestBody MentorOfferingUpdateRequest request) {
        return ResponseEntity.ok(offeringService.updateOffering(offeringId, request));
    }

    @DeleteMapping("/{offeringId}")
    public ResponseEntity<Void> deleteOffering(@PathVariable UUID offeringId) {
        offeringService.deleteOffering(offeringId);
        return ResponseEntity.noContent().build();
    }
}
