package com.skillbridge.review.api.controller;

import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.application.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ReviewControllerTest {

    @Test
    void submitsReview() {
        RecordingReviewService service = new RecordingReviewService();
        ReviewController controller = new ReviewController(service);
        UUID sessionId = UUID.randomUUID();
        SubmitReviewRequest request = new SubmitReviewRequest();

        assertEquals(HttpStatus.CREATED, controller.submitReview(sessionId, request).getStatusCode());
        assertEquals(sessionId, service.sessionId);
        assertEquals(request, service.request);
    }

    private static class RecordingReviewService extends ReviewService {
        private UUID sessionId;
        private SubmitReviewRequest request;

        RecordingReviewService() {
            super(null, null, null, null, null, null, null);
        }

        @Override
        public ReviewResponse submitReview(UUID sessionId, SubmitReviewRequest request) {
            this.sessionId = sessionId;
            this.request = request;
            ReviewResponse response = new ReviewResponse();
            response.setId(UUID.randomUUID());
            response.setRating(5);
            return response;
        }
    }
}
