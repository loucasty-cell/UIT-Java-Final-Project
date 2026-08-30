package com.skillbridge.swap.api.controller;

import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SwapControllerTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void createsSwapProposal() {
        RecordingSwapService service = new RecordingSwapService();
        SwapController controller = new SwapController(service);
        CreateSwapProposalRequest request = new CreateSwapProposalRequest();

        ResponseEntity<SwapRequestResponse> response = controller.createProposal(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(SwapRequestStatus.PENDING, response.getBody().getStatus());
        assertEquals(request, service.createRequest);
    }

    @Test
    void acceptsRejectsCompletesAndReturnsHistory() {
        UUID proposalId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        RecordingSwapService service = new RecordingSwapService();
        SwapController controller = new SwapController(service);
        TestAuthContext.loginAs(userId);

        assertEquals(SwapRequestStatus.ACCEPTED, controller.acceptProposal(proposalId).getBody().getStatus());
        assertEquals(proposalId, service.acceptedId);
        assertEquals(SwapRequestStatus.REJECTED, controller.rejectProposal(proposalId).getBody().getStatus());
        assertEquals(proposalId, service.rejectedId);
        assertEquals(SwapSessionStatus.COMPLETED, controller.completeSwapSession(sessionId).getBody().getStatus());
        assertEquals(sessionId, service.completedSessionId);
        assertEquals(1, controller.getSwapHistory().getBody().size());
    }

    private static class RecordingSwapService extends SwapService {
        private CreateSwapProposalRequest createRequest;
        private UUID acceptedId;
        private UUID rejectedId;
        private UUID completedSessionId;

        RecordingSwapService() {
            super(null, null, null, null, null, null, null, null, null);
        }

        @Override
        public SwapRequestResponse createProposal(CreateSwapProposalRequest request) {
            this.createRequest = request;
            return requestResponse(SwapRequestStatus.PENDING);
        }

        @Override
        public SwapRequestResponse acceptProposal(UUID requestId) {
            this.acceptedId = requestId;
            return requestResponse(SwapRequestStatus.ACCEPTED);
        }

        @Override
        public SwapRequestResponse rejectProposal(UUID requestId) {
            this.rejectedId = requestId;
            return requestResponse(SwapRequestStatus.REJECTED);
        }

        @Override
        public SwapSessionResponse completeSwapSession(UUID sessionId) {
            this.completedSessionId = sessionId;
            SwapSessionResponse response = new SwapSessionResponse();
            response.setId(sessionId);
            response.setStatus(SwapSessionStatus.COMPLETED);
            return response;
        }

        @Override
        public List<SwapRequestResponse> getSwapHistory() {
            return List.of(requestResponse(SwapRequestStatus.COMPLETED));
        }

        private SwapRequestResponse requestResponse(SwapRequestStatus status) {
            SwapRequestResponse response = new SwapRequestResponse();
            response.setId(UUID.randomUUID());
            response.setStatus(status);
            return response;
        }
    }
}
