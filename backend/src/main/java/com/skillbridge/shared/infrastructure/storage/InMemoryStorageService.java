package com.skillbridge.shared.infrastructure.storage;

import lombok.extern.slf4j.Slf4j;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * InMemoryStorageService: Simple in-memory file storage implementation
 * Usage: Development and testing environments (data lost on restart)
 * Performance: Very fast (Map-based), no I/O overhead
 * Persistence: None (suitable for dev/test where persistence not required)
 *
 * Linkage: Instantiated via StorageConfiguration when storage.provider=memory
 */
@Slf4j
public class InMemoryStorageService implements StorageService {

    private final Map<String, StoredFile> store = new HashMap<>();

    @Override
    public String store(String filename, byte[] content, String contentType) {
        String storageKey = UUID.randomUUID() + "-" + filename;
        store.put(storageKey, new StoredFile(filename, content, contentType));
        log.debug("Stored file in memory: {} (size: {} bytes)", storageKey, content.length);
        return storageKey;
    }

    @Override
    public byte[] load(String storageKey) {
        StoredFile file = store.get(storageKey);
        if (file == null) {
            log.warn("File not found in memory storage: {}", storageKey);
            throw new IllegalArgumentException("File not found: " + storageKey);
        }
        log.debug("Loaded file from memory: {}", storageKey);
        return file.content;
    }

    @Override
    public void delete(String storageKey) {
        if (store.remove(storageKey) != null) {
            log.debug("Deleted file from memory storage: {}", storageKey);
        } else {
            log.warn("File not found for deletion in memory storage: {}", storageKey);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        return store.containsKey(storageKey);
    }

    /**
     * Internal class to hold file metadata and content
     */
    private static class StoredFile {
        final String filename;
        final byte[] content;
        final String contentType;

        StoredFile(String filename, byte[] content, String contentType) {
            this.filename = filename;
            this.content = content;
            this.contentType = contentType;
        }
    }
}
