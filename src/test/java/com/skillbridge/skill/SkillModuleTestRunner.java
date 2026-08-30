package com.skillbridge.skill;

import com.skillbridge.skill.api.controller.SkillControllerTest;
import com.skillbridge.skill.api.mapper.SkillMapperTest;
import com.skillbridge.skill.application.SkillServiceTest;
import com.skillbridge.skill.domain.entity.SkillEntityMappingTest;
import com.skillbridge.skill.infrastructure.SkillRepositoryTest;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class SkillModuleTestRunner {

    private static final List<Class<?>> TEST_CLASSES = List.of(
            SkillEntityMappingTest.class,
            SkillRepositoryTest.class,
            SkillMapperTest.class,
            SkillServiceTest.class,
            SkillControllerTest.class
    );

    public static void main(String[] args) throws Exception {
        List<Throwable> failures = new ArrayList<>();
        int executed = 0;

        for (Class<?> testClass : TEST_CLASSES) {
            for (Method method : testClass.getDeclaredMethods()) {
                if (!method.isAnnotationPresent(Test.class)) {
                    continue;
                }

                executed++;
                Object instance = testClass.getDeclaredConstructor().newInstance();
                method.setAccessible(true);
                try {
                    method.invoke(instance);
                    System.out.println("PASS " + testClass.getSimpleName() + "." + method.getName());
                } catch (InvocationTargetException exception) {
                    Throwable failure = exception.getCause();
                    failures.add(failure);
                    System.out.println("FAIL " + testClass.getSimpleName() + "." + method.getName());
                    failure.printStackTrace(System.out);
                }
            }
        }

        System.out.println("Executed " + executed + " skill tests; failures: " + failures.size());
        if (!failures.isEmpty()) {
            throw new AssertionError("Skill module tests failed: " + failures.size());
        }
    }
}
