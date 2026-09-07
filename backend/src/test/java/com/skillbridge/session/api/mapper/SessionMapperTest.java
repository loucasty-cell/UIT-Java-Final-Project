package com.skillbridge.session.api.mapper;

import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.swap.api.mapper.SwapMapper;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

public class SessionMapperTest {

    @Test
    void mapsSwapSessionUsingFallbackWhenSwapMapperIsNull() {
        SessionMapper mapper = new SessionMapper(null);
        SwapSession session = createSession();

        SessionResponse response = mapper.toResponse(session);

        assertNotNull(response);
        assertEquals(session.getId(), response.getId());
        assertEquals(session.getSwapRequestId(), response.getSwapRequestId());
        assertEquals(session.getRequesterId(), response.getRequester().getId());
        assertEquals(session.getResponderId(), response.getResponder().getId());
        assertEquals(session.getOfferedSkillId(), response.getOfferedSkill().getId());
        assertEquals(session.getRequestedSkillId(), response.getRequestedSkill().getId());
        assertEquals(session.getPointCost(), response.getPointCost());
        assertEquals(SwapSessionStatus.ACCEPTED, response.getStatus());
        assertEquals(session.getMeetingUrl(), response.getMeetingUrl());
        assertEquals(session.getNotes(), response.getNotes());
        assertEquals(session.getDurationMinutes(), response.getDurationMinutes());
    }

    @Test
    void mapsNullSessionToNull() {
        SessionMapper mapper = new SessionMapper(null);
        assertNull(mapper.toResponse(null));
    }

    private SwapSession createSession() {
        SwapSession session = new SwapSession();
        session.setId(UUID.randomUUID());
        session.setSwapRequestId(UUID.randomUUID());
        session.setRequesterId(UUID.randomUUID());
        session.setResponderId(UUID.randomUUID());
        session.setOfferedSkillId(UUID.randomUUID());
        session.setRequestedSkillId(UUID.randomUUID());
        session.setPointCost(5);
        session.setStatus(SwapSessionStatus.ACCEPTED);
        session.setAcceptedAt(OffsetDateTime.now());
        session.setDurationMinutes(60);
        session.setMeetingUrl("https://meet.jit.si/skillbridge");
        session.setNotes("First pair programming session");
        session.setCreatedAt(OffsetDateTime.now());
        session.setUpdatedAt(OffsetDateTime.now());
        session.setVersion(0L);
        return session;
    }
}
