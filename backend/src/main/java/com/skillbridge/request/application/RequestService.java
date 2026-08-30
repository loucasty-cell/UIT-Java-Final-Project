package com.skillbridge.request.application;

import com.skillbridge.request.api.dto.request.CreateRequestProposalRequest;
import com.skillbridge.request.api.dto.response.RequestProposalResponse;
import com.skillbridge.request.api.mapper.RequestMapper;
import com.skillbridge.request.infrastructure.persistence.RequestProposalRepository;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class RequestService {

    private final SwapService swapService;
    private final RequestProposalRepository requestProposalRepository;
    private final RequestMapper requestMapper;

    public RequestProposalResponse createSwapProposal(CreateRequestProposalRequest request) {
        return requestMapper.toProposalResponse(
                swapService.createProposal(requestMapper.toSwapCreateRequest(request))
        );
    }

    public RequestProposalResponse acceptSwapProposal(UUID requestId) {
        return requestMapper.toProposalResponse(swapService.acceptProposal(requestId));
    }

    public RequestProposalResponse rejectSwapProposal(UUID requestId) {
        return requestMapper.toProposalResponse(swapService.rejectProposal(requestId));
    }

    public RequestProposalResponse cancelSwapProposal(UUID requestId) {
        return requestMapper.toProposalResponse(swapService.cancelProposal(requestId));
    }

    @Transactional(readOnly = true)
    public List<RequestProposalResponse> getSwapHistory() {
        return swapService.getSwapHistory().stream()
                .map(requestMapper::toProposalResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequestProposalResponse> getPendingSwapProposalsForResponder() {
        UUID responderId = SecurityUtils.getCurrentUserId();
        return requestProposalRepository
                .findByResponderIdAndStatusOrderByCreatedAtDesc(responderId, SwapRequestStatus.PENDING)
                .stream()
                .map(request -> requestMapper.toProposalResponse(swapService.getSwapProposal(request.getId())))
                .toList();
    }
}
