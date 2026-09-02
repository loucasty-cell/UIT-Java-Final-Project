package com.skillbridge.shared.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * StorageConfiguration: Spring @Configuration to instantiate StorageService bean
 * Chooses implementation (InMemory vs LocalFileSystem) based on application.yml property
 *
 * Linkage: 
 * - Read: skillbridge.storage.provider from application.yml
 * - Produce: @Bean StorageService for autowiring into CertificateService
 *
 * Usage in application.yml:
 *   skillbridge:
 *       storage:
 *           provider: memory  # or: filesystem
 *           filesystem:
 *               base-path: ./storage/certificates
 */
@Slf4j
@Configuration
public class StorageConfiguration {

    @Value("${skillbridge.storage.provider:memory}")
    private String storageProvider;

    @Value("${skillbridge.storage.filesystem.base-path:./storage/certificates}")
    private String filesystemBasePath;

    @Bean
    public StorageService storageService() {
        if ("filesystem".equalsIgnoreCase(storageProvider)) {
            log.info("Initializing LocalFileSystemStorageService with base path: {}", filesystemBasePath);
            return new LocalFileSystemStorageService(filesystemBasePath);
        } else {
            log.info("Initializing InMemoryStorageService (memory mode)");
            return new InMemoryStorageService();
        }
    }
}
