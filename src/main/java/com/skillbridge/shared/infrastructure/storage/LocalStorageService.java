package com.skillbridge.shared.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final Path storageDirectory;

    public LocalStorageService(@Value("${skillbridge.storage.local-dir:storage}") String storageDir) {
        this.storageDirectory = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize local storage directory: " + this.storageDirectory, e);
        }
    }

    @Override
    public String store(String originalFilename, byte[] content, String contentType) {
        if (content == null || content.length == 0) {
            throw new IllegalArgumentException("File content cannot be empty");
        }

        String extension = extractExtension(originalFilename);
        String storageKey = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path targetPath = resolveAndValidate(storageKey);

        try {
            Files.write(targetPath, content, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return storageKey;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file: " + storageKey, e);
        }
    }

    @Override
    public byte[] load(String storageKey) {
        Path targetPath = resolveAndValidate(storageKey);
        if (!Files.exists(targetPath)) {
            throw new IllegalArgumentException("File not found: " + storageKey);
        }

        try {
            return Files.readAllBytes(targetPath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read file: " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        Path targetPath = resolveAndValidate(storageKey);
        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete file: " + storageKey, e);
        }
    }

    @Override
    public boolean exists(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return false;
        }
        Path targetPath = resolveAndValidate(storageKey);
        return Files.exists(targetPath);
    }

    private Path resolveAndValidate(String storageKey) {
        if (storageKey == null || storageKey.contains("..") || storageKey.contains("/") || storageKey.contains("\\")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Path resolved = this.storageDirectory.resolve(storageKey).normalize();
        if (!resolved.startsWith(this.storageDirectory)) {
            throw new IllegalArgumentException("Path traversal attempt detected");
        }
        return resolved;
    }

    private String extractExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }
}

