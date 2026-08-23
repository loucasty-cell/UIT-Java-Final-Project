package com.skillbridge.review;

import com.skillbridge.review.api.controller.ReviewControllerTest;
import com.skillbridge.review.application.ReviewServiceTest;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class ReviewModuleTestRunner {

    private static final List<Class<?>> TEST_CLASSES = List.of(
            ReviewServiceTest.class,
            ReviewControllerTest.class
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
        System.out.println("Executed " + executed + " review tests; failures: " + failures.size());
        if (!failures.isEmpty()) {
            throw new AssertionError("Review module tests failed: " + failures.size());
        }
    }
}
