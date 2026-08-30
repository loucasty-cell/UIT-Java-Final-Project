package com.skillbridge.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

// SecurityConfig: Configures Spring Security stateless filter chain, JWT decoding, role extraction, CORS, and endpoint rules
// Linkage: Intercepts all incoming HTTP requests -> Applies CORS/CSRF policies -> Validates Bearer JWT -> Populates SecurityContext
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Configured frontend allowed origins for CORS preflight and access control
    @Value("${skillbridge.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    // Shared secret key used for HMAC-SHA256 JWT signature verification
    @Value("${skillbridge.security.jwt.secret}")
    private String jwtSecret;

    // Configures HTTP security filter chain: stateless sessions, public auth
    // matchers, and OAuth2 resource server
    // Linkage: Applied to every incoming HTTP request before reaching REST
    // controllers
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/v1/auth/**", "/actuator/health", "/v3/api-docs/**", "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/skills/**",
                                "/api/skills/**", "/api/v1/mentors/**", "/api/v1/forum/**", "/api/requests/**")
                        .permitAll()
                        .requestMatchers("/api/v1/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    // Configures HMAC-SHA256 NimbusJwtDecoder with the shared application secret
    // Linkage: Validates JWT signature, issuer, and expiration on protected routes
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }

    // Converts custom 'roles' claim in JWT to Spring Security GrantedAuthorities
    // (both 'ADMIN' and 'ROLE_ADMIN' formats)
    // Linkage: Bridges JWT claims with @PreAuthorize method security on controllers
    // and services
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            Object rolesObj = jwt.getClaim("roles");
            if (rolesObj instanceof Collection<?> roles) {
                for (Object role : roles) {
                    if (role != null) {
                        String r = role.toString().trim();
                        authorities.add(new SimpleGrantedAuthority(r));
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + r));
                    }
                }
            }
            return authorities;
        });
        return jwtAuthenticationConverter;
    }

    // Configures CORS filter to permit requests from specified frontend origin
    // domains
    // Linkage: Handles CORS preflight OPTIONS requests from web browser clients
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = new ArrayList<>();
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            for (String origin : allowedOrigins.split(",")) {
                if (!origin.isBlank()) {
                    origins.add(origin.trim());
                }
            }
        }
        if (origins.isEmpty()) {
            origins.addAll(List.of("http://localhost:*", "http://127.0.0.1:*", "http://localhost:8081", "http://localhost:8080", "http://localhost:5173", "http://localhost:3000"));
        }
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition", "X-Request-Id"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Password encoder bean (BCrypt) used by RegistrationService and
    // AuthenticationService
    // Linkage: Hashes plaintext passwords during registration and checks passwords
    // during login
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}