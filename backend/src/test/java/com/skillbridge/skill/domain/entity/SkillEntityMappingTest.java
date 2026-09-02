package com.skillbridge.skill.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SkillEntityMappingTest {

    @Test
    void mapsSkillEntityWithUuidIdAndValidation() throws NoSuchFieldException {
        assertEquals("com.skillbridge.skill.domain.entity", Skill.class.getPackageName());
        assertTrue(Skill.class.isAnnotationPresent(Entity.class));
        assertEquals("skills", Skill.class.getAnnotation(Table.class).name());

        Field id = Skill.class.getDeclaredField("id");
        assertEquals(UUID.class, id.getType());
        assertTrue(id.isAnnotationPresent(Id.class));
        assertEquals(GenerationType.UUID, id.getAnnotation(GeneratedValue.class).strategy());

        assertEquals(String.class, Skill.class.getDeclaredField("name").getType());
        assertEquals(String.class, Skill.class.getDeclaredField("category").getType());
        assertEquals(String.class, Skill.class.getDeclaredField("description").getType());
        assertEquals(OffsetDateTime.class, Skill.class.getDeclaredField("createdAt").getType());
        assertEquals(OffsetDateTime.class, Skill.class.getDeclaredField("updatedAt").getType());

        assertNotNull(Skill.class.getDeclaredField("name").getAnnotation(NotBlank.class));
        assertNotNull(Skill.class.getDeclaredField("category").getAnnotation(NotBlank.class));
        assertEquals("created_at", Skill.class.getDeclaredField("createdAt").getAnnotation(Column.class).name());
        assertEquals("updated_at", Skill.class.getDeclaredField("updatedAt").getAnnotation(Column.class).name());
    }
}
