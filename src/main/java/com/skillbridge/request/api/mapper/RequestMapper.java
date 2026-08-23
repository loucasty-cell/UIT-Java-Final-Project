package com.skillbridge.request.api.mapper;

import com.skillbridge.request.api.dto.request.CreateRequestProposalRequest;
import com.skillbridge.request.api.dto.response.RequestProposalResponse;
import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import org.springframework.stereotype.Component;

@Component
public class RequestMapper {

    public CreateSwapProposalRequest toSwapCreateRequest(CreateRequestProposalRequest request) {
        CreateSwapProposalRequest swapRequest = new CreateSwapProposalRequest();
        swapRequest.setRequesterId(request.getRequesterId());
        swapRequest.setResponderId(request.getResponderId());
        swapRequest.setOfferedSkillId(request.getOfferedSkillId());
        swapRequest.setRequestedSkillId(request.getRequestedSkillId());
        swapRequest.setPointCost(request.getPointCost());
        swapRequest.setMessage(request.getMessage());
        return swapRequest;
    }

    public RequestProposalResponse toProposalResponse(SwapRequestResponse swapResponse) {
        if (swapResponse == null) {
            return null;
        }

        RequestProposalResponse response = new RequestProposalResponse();
        response.setId(swapResponse.getId());
        response.setRequester(swapResponse.getRequester());
        response.setResponder(swapResponse.getResponder());
        response.setOfferedSkill(swapResponse.getOfferedSkill());
        response.setRequestedSkill(swapResponse.getRequestedSkill());
        response.setPointCost(swapResponse.getPointCost());
        response.setPointsHeld(swapResponse.getPointsHeld());
        response.setMessage(swapResponse.getMessage());
        response.setStatus(swapResponse.getStatus());
        response.setSessionId(swapResponse.getSessionId());
        response.setAcceptedAt(swapResponse.getAcceptedAt());
        response.setRejectedAt(swapResponse.getRejectedAt());
        response.setCompletedAt(swapResponse.getCompletedAt());
        response.setCancelledAt(swapResponse.getCancelledAt());
        response.setCreatedAt(swapResponse.getCreatedAt());
        response.setUpdatedAt(swapResponse.getUpdatedAt());
        response.setVersion(swapResponse.getVersion());
        return response;
    }
}
