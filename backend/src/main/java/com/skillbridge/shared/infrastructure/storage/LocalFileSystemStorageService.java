package com.skillbridge.shared.infrastructure.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * LocalFileSystemStorageService: Persistent file storage on local filesystem
 * Usage: Production environments where file persistence is required
 * Performance: Moderate (disk I/O), suitable for production
 * Persistence: Yes (files survive application restarts)
 *
 * Linkage: Instantiated via StorageConfiguration when storage.provider=filesystem
 * Configuration: base-path from application.yml (default: ./storage/certificates)
 */
@Slf4j
@RequiredArgsConstructor
public class LocalFileSystemStorageService implements StorageService {

    private final String basePath;

    @Override
    public String store(String filename, byte[] content, String contentType) {
        try {
            // Create storage key with UUID to avoid filename collisions
            String storageKey = UUID.randomUUID() + ".pdf";
            Path storagePath = Paths.get(basePath);

            // Ensure directory exists
            Files.createDirectories(storagePath);

            // Write file to disk
            Path filePath = storagePath.resolve(storageKey);
            Files.write(filePath, content);

            log.info("Stored file on filesystem: {} (path: {}, size: {} bytes)",
                    storageKey, filePath.toAbsolutePath(), content.length);
            return storageKey;
        } catch (IOException e) {
            log.error("Failed to store file on filesystem", e);
            throw new IllegalStateException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] load(String storageKey) {
        try {
            Path filePath = Paths.get(basePath, storageKey);
            if (!Files.exists(filePath)) {
                log.warn("File not found on filesystem: {}", filePath.toAbsolutePath());
                throw new IllegalArgumentException("File not found: " + storageKey);
            }

            byte[] content = Files.readAllBytes(filePath);
            log.debug("Loaded file from filesystem: {} (size: {} bytes)", storageKey, content.length);
            return content;
        } catch (IOException e) {
            log.error("Failed to load file from filesystem: {}", storageKey, e);
            throw new IllegalStateException("Failed to load file: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path filePath = Paths.get(basePath, storageKey);
            if (Files.deleteIfExists(filePath)) {
                log.info("Deleted file from filesystem: {}", filePath.toAbsolutePath());
            } else {
                log.warn("File not found for deletion on filesystem: {}", filePath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Failed to delete file from filesystem: {}", storageKey, e);
            throw new IllegalStateException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        Path filePath = Paths.get(basePath, storageKey);
        return Files.exists(filePath);
    }
}
