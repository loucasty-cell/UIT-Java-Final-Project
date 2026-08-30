package com.skillbridge.shared.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Custom primary DataSource bean that cleanly parses any database URL format from .env
 * (raw postgresql://user:pass@host/db or jdbc:postgresql://...), strips embedded credentials
 * from the JDBC URL string, and configures 1-hour connection pool & keepalive timers for Neon.
 */
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(
            Environment env,
            @Value("${spring.datasource.hikari.maximum-pool-size:10}") int maxPoolSize,
            @Value("${spring.datasource.hikari.minimum-idle:2}") int minIdle,
            @Value("${spring.datasource.hikari.connection-timeout:60000}") long connectionTimeout,
            @Value("${spring.datasource.hikari.idle-timeout:3600000}") long idleTimeout,
            @Value("${spring.datasource.hikari.max-lifetime:3600000}") long maxLifetime,
            @Value("${spring.datasource.hikari.keepalive-time:60000}") long keepaliveTime
    ) {
        String rawUrl = env.getProperty("DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = env.getProperty("spring.datasource.url", "jdbc:postgresql://localhost:5432/skillbridge?sslmode=disable");
        }

        String username = env.getProperty("DATABASE_USERNAME");
        if (username == null || username.isBlank()) {
            username = env.getProperty("spring.datasource.username", "postgres");
        }

        String password = env.getProperty("DATABASE_PASSWORD");
        if (password == null || password.isBlank()) {
            password = env.getProperty("spring.datasource.password", "postgres");
        }

        String trimmed = rawUrl.trim();
        String uriString = trimmed;
        if (uriString.startsWith("jdbc:")) {
            uriString = uriString.substring(5);
        }
        if (uriString.startsWith("postgres://")) {
            uriString = "postgresql://" + uriString.substring("postgres://".length());
        }

        String cleanJdbcUrl = trimmed;
        if (uriString.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(uriString);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    if (parts.length > 0 && !parts[0].isBlank()) {
                        username = parts[0];
                    }
                    if (parts.length > 1 && !parts[1].isBlank()) {
                        password = parts[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder sb = new StringBuilder("jdbc:postgresql://");
                sb.append(host != null ? host : "localhost");
                if (port > 0) {
                    sb.append(":").append(port);
                }
                if (path != null && !path.isBlank()) {
                    sb.append(path);
                }
                if (query != null && !query.isBlank()) {
                    sb.append("?").append(query);
                }
                cleanJdbcUrl = sb.toString();
            } catch (Exception ignored) {
                if (!cleanJdbcUrl.startsWith("jdbc:")) {
                    cleanJdbcUrl = "jdbc:" + cleanJdbcUrl;
                }
            }
        } else if (!cleanJdbcUrl.startsWith("jdbc:")) {
            cleanJdbcUrl = "jdbc:" + cleanJdbcUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl(cleanJdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setKeepaliveTime(keepaliveTime);
        config.setValidationTimeout(5000);

        return new HikariDataSource(config);
    }
}

