package com.skillbridge.skill.infrastructure;

import com.skillbridge.skill.domain.Skill;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class SkillRepositoryTest {

    @Test
    void extendsJpaRepositoryWithUuidIdentifier() {
        assertTrue(JpaRepository.class.isAssignableFrom(SkillRepository.class));

        ParameterizedType repositoryType = findJpaRepositoryType();
        assertEquals(Skill.class, repositoryType.getActualTypeArguments()[0]);
        assertEquals(UUID.class, repositoryType.getActualTypeArguments()[1]);
    }

    @Test
    void declaresCustomFinderMethods() throws NoSuchMethodException {
        Method categoryFinder = SkillRepository.class.getMethod("findByCategory", String.class);
        Method nameFinder = SkillRepository.class.getMethod("findByNameContainingIgnoreCase", String.class);

        assertEquals(List.class, categoryFinder.getReturnType());
        assertEquals(List.class, nameFinder.getReturnType());
    }

    private ParameterizedType findJpaRepositoryType() {
        for (Type type : SkillRepository.class.getGenericInterfaces()) {
            if (type instanceof ParameterizedType parameterizedType
                    && parameterizedType.getRawType().equals(JpaRepository.class)) {
                return parameterizedType;
            }
        }
        throw new AssertionError("SkillRepository does not directly extend JpaRepository");
    }
}
