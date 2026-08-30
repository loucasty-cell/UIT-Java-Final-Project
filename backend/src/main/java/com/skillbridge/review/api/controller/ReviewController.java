package com.skillbridge.review.api.controller;

import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.application.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/reviews", "/api/v1/reviews"})
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/sessions/{sessionId}")
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SubmitReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.submitReview(sessionId, request));
    }
}
