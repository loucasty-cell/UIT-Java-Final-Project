package com.skillbridge.request.api.controller;

import com.skillbridge.request.api.dto.request.CreateRequestProposalRequest;
import com.skillbridge.request.api.dto.response.RequestProposalResponse;
import com.skillbridge.request.application.RequestService;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RequestControllerTest {

    @AfterEach
    void logout() {
        TestAuthContext.logout();
    }

    @Test
    void exposesSwapProposalLifecycleEndpoints() {
        RecordingRequestService service = new RecordingRequestService();
        RequestController controller = new RequestController(service);
        CreateRequestProposalRequest request = new CreateRequestProposalRequest();
        UUID requestId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        TestAuthContext.loginAs(userId);

        ResponseEntity<RequestProposalResponse> created = controller.createSwapProposal(request);

        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertEquals(request, service.createRequest);
        assertEquals(SwapRequestStatus.ACCEPTED, controller.acceptSwapProposal(requestId).getBody().getStatus());
        assertEquals(requestId, service.acceptedId);
        assertEquals(SwapRequestStatus.REJECTED, controller.rejectSwapProposal(requestId).getBody().getStatus());
        assertEquals(requestId, service.rejectedId);
        assertEquals(SwapRequestStatus.CANCELLED, controller.cancelSwapProposal(requestId).getBody().getStatus());
        assertEquals(requestId, service.cancelledId);
        assertEquals(1, controller.getSwapHistory().getBody().size());
        assertEquals(1, controller.getPendingSwapProposalsForResponder().getBody().size());
    }

    private static class RecordingRequestService extends RequestService {
        private CreateRequestProposalRequest createRequest;
        private UUID acceptedId;
        private UUID rejectedId;
        private UUID cancelledId;

        RecordingRequestService() {
            super(null, null, null);
        }

        @Override
        public RequestProposalResponse createSwapProposal(CreateRequestProposalRequest request) {
            this.createRequest = request;
            return response(SwapRequestStatus.PENDING);
        }

        @Override
        public RequestProposalResponse acceptSwapProposal(UUID requestId) {
            this.acceptedId = requestId;
            return response(SwapRequestStatus.ACCEPTED);
        }

        @Override
        public RequestProposalResponse rejectSwapProposal(UUID requestId) {
            this.rejectedId = requestId;
            return response(SwapRequestStatus.REJECTED);
        }

        @Override
        public RequestProposalResponse cancelSwapProposal(UUID requestId) {
            this.cancelledId = requestId;
            return response(SwapRequestStatus.CANCELLED);
        }

        @Override
        public List<RequestProposalResponse> getSwapHistory() {
            return List.of(response(SwapRequestStatus.COMPLETED));
        }

        @Override
        public List<RequestProposalResponse> getPendingSwapProposalsForResponder() {
            return List.of(response(SwapRequestStatus.PENDING));
        }

        private RequestProposalResponse response(SwapRequestStatus status) {
            RequestProposalResponse response = new RequestProposalResponse();
            response.setId(UUID.randomUUID());
            response.setStatus(status);
            return response;
        }
    }
}
