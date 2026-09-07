package com.skillbridge.review.api.controller;

import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.application.ReviewService;
import com.skillbridge.shared.api.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping({"/api/reviews", "/api/v1/reviews"})
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<List<ReviewResponse>> getSessionReviews(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(reviewService.getSessionReviews(sessionId));
    }

    @GetMapping("/mentors/{mentorId}")
    public ResponseEntity<PageResponse<ReviewResponse>> getMentorReviews(
            @PathVariable UUID mentorId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(reviewService.getMentorReviews(mentorId, pageable));
    }

    @PostMapping("/sessions/{sessionId}")
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.submitReview(sessionId, request));
    }
}
