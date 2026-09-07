package com.skillbridge.swap;

import com.skillbridge.swap.api.controller.SwapControllerTest;
import com.skillbridge.swap.application.SwapServiceTest;
import com.skillbridge.swap.domain.SwapEntityMappingTest;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class SwapModuleTestRunner {

    private static final List<Class<?>> TEST_CLASSES = List.of(
            SwapEntityMappingTest.class,
            SwapServiceTest.class,
            SwapControllerTest.class
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

        System.out.println("Executed " + executed + " swap tests; failures: " + failures.size());
        if (!failures.isEmpty()) {
            throw new AssertionError("Swap module tests failed: " + failures.size());
        }
    }
}
