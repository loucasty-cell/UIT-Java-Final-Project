package com.skillbridge.learningneed.api.controller;

import com.skillbridge.learningneed.api.dto.request.LearningNeedCreateRequest;
import com.skillbridge.learningneed.api.dto.request.TeachingOfferCreateRequest;
import com.skillbridge.learningneed.api.dto.response.LearningNeedResponse;
import com.skillbridge.learningneed.application.LearningNeedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/learning-needs")
@RequiredArgsConstructor
public class LearningNeedController {
    private final LearningNeedService learningNeedService;

    @GetMapping
    public ResponseEntity<List<LearningNeedResponse>> listActive() {
        return ResponseEntity.ok(learningNeedService.listActive());
    }

    @PostMapping
    public ResponseEntity<LearningNeedResponse> create(@Valid @RequestBody LearningNeedCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningNeedService.create(request));
    }

    @PostMapping("/{needId}/offers")
    public ResponseEntity<LearningNeedResponse> offerToTeach(
            @PathVariable UUID needId,
            @Valid @RequestBody TeachingOfferCreateRequest request
    ) {
        return ResponseEntity.ok(learningNeedService.offerToTeach(needId, request));
    }

    @DeleteMapping("/{needId}")
    public ResponseEntity<Void> delete(@PathVariable UUID needId) {
        learningNeedService.delete(needId);
        return ResponseEntity.noContent().build();
    }
}
