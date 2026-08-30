package com.skillbridge.review.domain;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.swap.domain.entity.SwapSession;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ReviewEntityMappingTest {

    @Test
    void mapsReviewToSessionUsersAndSkill() throws NoSuchFieldException {
        assertEquals("reviews", Review.class.getAnnotation(Table.class).name());

        assertRelationship(Review.class.getDeclaredField("session"), SwapSession.class, "session_id");
        assertRelationship(Review.class.getDeclaredField("reviewer"), User.class, "reviewer_id");
        assertRelationship(Review.class.getDeclaredField("reviewee"), User.class, "reviewee_id");
        assertRelationship(Review.class.getDeclaredField("skill"), Skill.class, "skill_id");

        assertEquals(UUID.class, Review.class.getDeclaredField("sessionId").getType());
        assertEquals(UUID.class, Review.class.getDeclaredField("reviewerId").getType());
        assertEquals(UUID.class, Review.class.getDeclaredField("revieweeId").getType());
        assertEquals(UUID.class, Review.class.getDeclaredField("skillId").getType());
        assertEquals(Integer.class, Review.class.getDeclaredField("rating").getType());
        assertEquals(String.class, Review.class.getDeclaredField("feedback").getType());
    }

    private void assertRelationship(Field field, Class<?> expectedType, String joinColumn) {
        assertEquals(expectedType, field.getType());
        assertTrue(field.isAnnotationPresent(ManyToOne.class));
        assertEquals(joinColumn, field.getAnnotation(JoinColumn.class).name());
    }
}
