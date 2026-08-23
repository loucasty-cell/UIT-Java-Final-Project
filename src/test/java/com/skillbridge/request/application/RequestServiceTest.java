package com.skillbridge.request.application;

import com.skillbridge.request.api.dto.request.CreateRequestProposalRequest;
import com.skillbridge.request.api.dto.response.RequestProposalResponse;
import com.skillbridge.request.api.mapper.RequestMapper;
import com.skillbridge.request.infrastructure.persistence.RequestProposalRepository;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RequestServiceTest {

    @Test
    void delegatesCreateAcceptRejectCancelAndHistoryToSwapService() {
        RecordingSwapService swapService = new RecordingSwapService();
        RequestService service = new RequestService(
                swapService,
                emptyRepository(),
                new RequestMapper()
        );
        CreateRequestProposalRequest createRequest = createRequest();
        UUID requestId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        assertEquals(SwapRequestStatus.PENDING, service.createSwapProposal(createRequest).getStatus());
        assertEquals(createRequest.getRequesterId(), swapService.createRequest.getRequesterId());
        assertEquals(SwapRequestStatus.ACCEPTED, service.acceptSwapProposal(requestId).getStatus());
        assertEquals(requestId, swapService.acceptedId);
        assertEquals(SwapRequestStatus.REJECTED, service.rejectSwapProposal(requestId).getStatus());
        assertEquals(requestId, swapService.rejectedId);
        assertEquals(SwapRequestStatus.CANCELLED, service.cancelSwapProposal(requestId).getStatus());
        assertEquals(requestId, swapService.cancelledId);
        assertEquals(1, service.getSwapHistory(userId).size());
        assertEquals(userId, swapService.historyUserId);
    }

    @Test
    void mapsPendingRepositoryRowsThroughSwapService() {
        UUID responderId = UUID.randomUUID();
        UUID requestId = UUID.randomUUID();
        RecordingSwapService swapService = new RecordingSwapService();
        RequestProposalRepository repository = repositoryWithPending(responderId, requestId);
        RequestService service = new RequestService(swapService, repository, new RequestMapper());

        List<RequestProposalResponse> responses = service.getPendingSwapProposalsForResponder(responderId);

        assertEquals(1, responses.size());
        assertEquals(requestId, responses.get(0).getId());
        assertEquals(requestId, swapService.loadedId);
    }

    private CreateRequestProposalRequest createRequest() {
        CreateRequestProposalRequest request = new CreateRequestProposalRequest();
        request.setRequesterId(UUID.randomUUID());
        request.setResponderId(UUID.randomUUID());
        request.setOfferedSkillId(UUID.randomUUID());
        request.setRequestedSkillId(UUID.randomUUID());
        request.setPointCost(5);
        request.setMessage("Swap?");
        return request;
    }

    private RequestProposalRepository emptyRepository() {
        return repositoryWithPending(UUID.randomUUID(), UUID.randomUUID());
    }

    private RequestProposalRepository repositoryWithPending(UUID responderId, UUID requestId) {
        return RequestProposalRepository.class.cast(Proxy.newProxyInstance(
                RequestProposalRepository.class.getClassLoader(),
                new Class<?>[]{RequestProposalRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findByResponderIdAndStatusOrderByCreatedAtDesc" -> {
                        SwapRequest request = new SwapRequest();
                        request.setId(requestId);
                        request.setResponderId(responderId);
                        request.setStatus(SwapRequestStatus.PENDING);
                        yield List.of(request);
                    }
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "toString" -> "RequestProposalRepository test proxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        ));
    }

    private static class RecordingSwapService extends SwapService {
        private CreateSwapProposalRequest createRequest;
        private UUID acceptedId;
        private UUID rejectedId;
        private UUID cancelledId;
        private UUID historyUserId;
        private UUID loadedId;

        RecordingSwapService() {
            super(null, null, null, null, null, null, null, null);
        }

        @Override
        public SwapRequestResponse createProposal(CreateSwapProposalRequest request) {
            this.createRequest = request;
            return response(UUID.randomUUID(), SwapRequestStatus.PENDING);
        }

        @Override
        public SwapRequestResponse acceptProposal(UUID requestId) {
            this.acceptedId = requestId;
            return response(requestId, SwapRequestStatus.ACCEPTED);
        }

        @Override
        public SwapRequestResponse rejectProposal(UUID requestId) {
            this.rejectedId = requestId;
            return response(requestId, SwapRequestStatus.REJECTED);
        }

        @Override
        public SwapRequestResponse cancelProposal(UUID requestId) {
            this.cancelledId = requestId;
            return response(requestId, SwapRequestStatus.CANCELLED);
        }

        @Override
        public SwapRequestResponse getSwapProposal(UUID requestId) {
            this.loadedId = requestId;
            return response(requestId, SwapRequestStatus.PENDING);
        }

        @Override
        public List<SwapRequestResponse> getSwapHistory(UUID userId) {
            this.historyUserId = userId;
            return List.of(response(UUID.randomUUID(), SwapRequestStatus.COMPLETED));
        }

        private SwapRequestResponse response(UUID id, SwapRequestStatus status) {
            SwapRequestResponse response = new SwapRequestResponse();
            response.setId(id);
            response.setStatus(status);
            response.setCreatedAt(OffsetDateTime.now());
            UserSummaryResponse requester = new UserSummaryResponse();
            requester.setId(UUID.randomUUID());
            response.setRequester(requester);
            return response;
        }
    }
}
