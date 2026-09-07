package com.skillbridge.shared.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes PostgreSQL connection URLs to standard JDBC format (jdbc:postgresql://).
 * Handles raw Neon/Heroku/Supabase URLs like postgresql://user:pass@host/db or postgres://...
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = environment.getProperty("spring.datasource.url");
        }

        if (dbUrl != null && !dbUrl.isBlank()) {
            String trimmed = dbUrl.trim();
            String normalizedUrl = null;

            if (trimmed.startsWith("postgresql://")) {
                normalizedUrl = "jdbc:" + trimmed;
            } else if (trimmed.startsWith("postgres://")) {
                normalizedUrl = "jdbc:postgresql://" + trimmed.substring("postgres://".length());
            }

            if (normalizedUrl != null) {
                Map<String, Object> properties = new HashMap<>();
                properties.put("spring.datasource.url", normalizedUrl);
                properties.put("DATABASE_URL", normalizedUrl);
                environment.getPropertySources().addFirst(
                        new MapPropertySource("normalizedDatabaseUrlProperties", properties)
                );
            }
        }
    }
}

