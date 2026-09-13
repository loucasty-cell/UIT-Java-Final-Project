package com.skillbridge.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillbridge.auth.application.command.AccountAccessService;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AccountStatusFilter extends OncePerRequestFilter {
    private final UserRepository userRepository;
    private final AccountAccessService accountAccessService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt jwt) {
            try {
                UUID userId = UUID.fromString(jwt.getSubject());
                accountAccessService.requireAccessible(userRepository.findById(userId)
                        .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Account no longer exists.")));
            } catch (org.springframework.security.access.AccessDeniedException exception) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                objectMapper.writeValue(response.getOutputStream(), Map.of(
                        "title", "Account unavailable",
                        "status", HttpServletResponse.SC_FORBIDDEN,
                        "code", "ACCOUNT_UNAVAILABLE",
                        "detail", exception.getMessage(),
                        "timestamp", OffsetDateTime.now().toString()
                ));
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
