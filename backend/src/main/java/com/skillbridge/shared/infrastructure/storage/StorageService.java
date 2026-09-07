package com.skillbridge.shared.infrastructure.storage;

/**
 * StorageService: Abstraction for file storage operations (certificates, documents, etc.)
 * Implementations can store files in-memory (dev), filesystem, cloud storage (AWS S3, Azure Blob), etc.
 *
 * Linkage: CertificateService uses this to store/load/delete PDF certificates
 * Configuration: @Bean instantiated in StorageConfiguration, implementation chosen via application.yml
 */
public interface StorageService {

    /**
     * Store a file and return a unique storage key for retrieval
     *
     * @param filename Original filename (e.g., "diploma.pdf")
     * @param content File content as byte array
     * @param contentType MIME type (e.g., "application/pdf")
     * @return Unique storage key for later retrieval (e.g., "uuid-filename")
     * @throws IllegalStateException if storage operation fails
     */
    String store(String filename, byte[] content, String contentType);

    /**
     * Load file content from storage using previously issued storage key
     *
     * @param storageKey Key returned by store()
     * @return File content as byte array
     * @throws IllegalArgumentException if file not found
     */
    byte[] load(String storageKey);

    /**
     * Delete file from storage
     *
     * @param storageKey Key returned by store()
     * @throws IllegalArgumentException if file not found
     */
    void delete(String storageKey);

    /**
     * Check if file exists in storage
     *
     * @param storageKey Key returned by store()
     * @return true if file exists, false otherwise
     */
    boolean exists(String storageKey);
}
