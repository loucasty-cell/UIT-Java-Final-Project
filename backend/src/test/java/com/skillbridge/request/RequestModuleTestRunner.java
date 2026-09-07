package com.skillbridge.request;

import com.skillbridge.request.api.controller.RequestControllerTest;
import com.skillbridge.request.application.RequestServiceTest;
import com.skillbridge.request.infrastructure.RequestProposalRepositoryTest;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

public class RequestModuleTestRunner {

    private static final List<Class<?>> TEST_CLASSES = List.of(
            RequestProposalRepositoryTest.class,
            RequestServiceTest.class,
            RequestControllerTest.class
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

        System.out.println("Executed " + executed + " request tests; failures: " + failures.size());
        if (!failures.isEmpty()) {
            throw new AssertionError("Request module tests failed: " + failures.size());
        }
    }
}
