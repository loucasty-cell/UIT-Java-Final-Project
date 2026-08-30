package com.skillbridge.shared.infrastructure.storage;

public interface StorageService {

    String store(String originalFilename, byte[] content, String contentType);

    byte[] load(String storageKey);

    void delete(String storageKey);

    boolean exists(String storageKey);
}

