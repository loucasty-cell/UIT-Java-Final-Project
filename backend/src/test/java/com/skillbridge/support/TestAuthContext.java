package com.skillbridge.support;

import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public final class TestAuthContext {

    private TestAuthContext() {
    }

    public static void loginAs(UUID userId) {
        Jwt jwt = new Jwt(
                "test-token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "HS256"),
                Map.of("sub", userId.toString())
        );
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(jwt, null);
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    public static void logout() {
        SecurityContextHolder.clearContext();
    }
}
