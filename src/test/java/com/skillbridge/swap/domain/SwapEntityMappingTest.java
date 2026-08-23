package com.skillbridge.swap.domain;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.skill.domain.Skill;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SwapEntityMappingTest {

    @Test
    void mapsSwapRequestToUsersAndSkills() throws NoSuchFieldException {
        assertEquals("swap_requests", SwapRequest.class.getAnnotation(Table.class).name());

        assertRelationship(SwapRequest.class.getDeclaredField("requester"), User.class, "requester_id");
        assertRelationship(SwapRequest.class.getDeclaredField("responder"), User.class, "responder_id");
        assertRelationship(SwapRequest.class.getDeclaredField("offeredSkill"), Skill.class, "offered_skill_id");
        assertRelationship(SwapRequest.class.getDeclaredField("requestedSkill"), Skill.class, "requested_skill_id");
        assertEquals(UUID.class, SwapRequest.class.getDeclaredField("requesterId").getType());
        assertEquals(UUID.class, SwapRequest.class.getDeclaredField("responderId").getType());
    }

    @Test
    void mapsSwapSessionToRequestUsersAndSkills() throws NoSuchFieldException {
        assertEquals("swap_sessions", SwapSession.class.getAnnotation(Table.class).name());
        assertTrue(SwapSession.class.getDeclaredField("swapRequest").isAnnotationPresent(OneToOne.class));
        assertEquals("swap_request_id", SwapSession.class.getDeclaredField("swapRequest")
                .getAnnotation(JoinColumn.class).name());

        assertRelationship(SwapSession.class.getDeclaredField("requester"), User.class, "requester_id");
        assertRelationship(SwapSession.class.getDeclaredField("responder"), User.class, "responder_id");
        assertRelationship(SwapSession.class.getDeclaredField("offeredSkill"), Skill.class, "offered_skill_id");
        assertRelationship(SwapSession.class.getDeclaredField("requestedSkill"), Skill.class, "requested_skill_id");
    }

    private void assertRelationship(Field field, Class<?> expectedType, String joinColumn) {
        assertEquals(expectedType, field.getType());
        assertTrue(field.isAnnotationPresent(ManyToOne.class));
        assertEquals(joinColumn, field.getAnnotation(JoinColumn.class).name());
    }
}
