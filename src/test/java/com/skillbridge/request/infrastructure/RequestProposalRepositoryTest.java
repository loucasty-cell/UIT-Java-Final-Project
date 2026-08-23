package com.skillbridge.request.infrastructure;

import com.skillbridge.request.infrastructure.persistence.RequestProposalRepository;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RequestProposalRepositoryTest {

    @Test
    void extendsJpaRepositoryForSharedSwapRequestEntity() {
        assertTrue(JpaRepository.class.isAssignableFrom(RequestProposalRepository.class));

        ParameterizedType repositoryType = findJpaRepositoryType();
        assertEquals(SwapRequest.class, repositoryType.getActualTypeArguments()[0]);
        assertEquals(UUID.class, repositoryType.getActualTypeArguments()[1]);
    }

    @Test
    void declaresRequestQueryMethods() throws NoSuchMethodException {
        Method history = RequestProposalRepository.class.getMethod(
                "findByRequesterIdOrResponderIdOrderByCreatedAtDesc",
                UUID.class,
                UUID.class
        );
        Method pending = RequestProposalRepository.class.getMethod(
                "findByResponderIdAndStatusOrderByCreatedAtDesc",
                UUID.class,
                SwapRequestStatus.class
        );

        assertEquals(List.class, history.getReturnType());
        assertEquals(List.class, pending.getReturnType());
    }

    private ParameterizedType findJpaRepositoryType() {
        for (Type type : RequestProposalRepository.class.getGenericInterfaces()) {
            if (type instanceof ParameterizedType parameterizedType
                    && parameterizedType.getRawType().equals(JpaRepository.class)) {
                return parameterizedType;
            }
        }
        throw new AssertionError("RequestProposalRepository does not directly extend JpaRepository");
    }
}
