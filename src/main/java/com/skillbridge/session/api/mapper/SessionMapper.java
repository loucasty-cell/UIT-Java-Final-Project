package com.skillbridge.session.api.mapper;

import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.api.mapper.SwapMapper;
import com.skillbridge.swap.domain.entity.SwapSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SessionMapper {

    private final SwapMapper swapMapper;

    public SessionResponse toResponse(SwapSession session) {
        if (session == null) {
            return null;
        }
        if (swapMapper == null) {
            return fallbackResponse(session);
        }

        SwapSessionResponse swapResponse = swapMapper.toSessionResponse(session);
        SessionResponse response = new SessionResponse();
        response.setId(swapResponse.getId());
        response.setSwapRequestId(swapResponse.getSwapRequestId());
        response.setRequester(swapResponse.getRequester());
        response.setResponder(swapResponse.getResponder());
        response.setOfferedSkill(swapResponse.getOfferedSkill());
        response.setRequestedSkill(swapResponse.getRequestedSkill());
        response.setPointCost(swapResponse.getPointCost());
        response.setStatus(swapResponse.getStatus());
        response.setAcceptedAt(swapResponse.getAcceptedAt());
        response.setCompletedAt(swapResponse.getCompletedAt());
        response.setCreatedAt(swapResponse.getCreatedAt());
        response.setUpdatedAt(swapResponse.getUpdatedAt());
        response.setVersion(swapResponse.getVersion());
        response.setStartedAt(session.getStartedAt());
        response.setScheduledAt(session.getScheduledAt());
        response.setDurationMinutes(session.getDurationMinutes());
        response.setMeetingUrl(session.getMeetingUrl());
        response.setNotes(session.getNotes());
        return response;
    }

    public SessionResponse fallbackResponse(SwapSession session) {
        SessionResponse response = new SessionResponse();
        response.setId(session.getId());
        response.setSwapRequestId(session.getSwapRequestId());
        response.setRequester(summary(session.getRequesterId()));
        response.setResponder(summary(session.getResponderId()));
        response.setOfferedSkill(skillSummary(session.getOfferedSkillId()));
        response.setRequestedSkill(skillSummary(session.getRequestedSkillId()));
        response.setPointCost(session.getPointCost());
        response.setStatus(session.getStatus());
        response.setAcceptedAt(session.getAcceptedAt());
        response.setStartedAt(session.getStartedAt());
        response.setCompletedAt(session.getCompletedAt());
        response.setScheduledAt(session.getScheduledAt());
        response.setDurationMinutes(session.getDurationMinutes());
        response.setMeetingUrl(session.getMeetingUrl());
        response.setNotes(session.getNotes());
        response.setCreatedAt(session.getCreatedAt());
        response.setUpdatedAt(session.getUpdatedAt());
        response.setVersion(session.getVersion());
        return response;
    }

    private UserSummaryResponse summary(java.util.UUID userId) {
        UserSummaryResponse summary = new UserSummaryResponse();
        summary.setId(userId);
        return summary;
    }

    private SkillSummaryResponse skillSummary(java.util.UUID skillId) {
        SkillSummaryResponse summary = new SkillSummaryResponse();
        summary.setId(skillId);
        return summary;
    }
}
