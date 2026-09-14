package com.skillbridge.user.application.command;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.shared.infrastructure.storage.StorageService;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AvatarService {
    private static final long MAX_AVATAR_SIZE = 2 * 1024 * 1024;
    private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final UserRepository userRepository;
    private final StorageService storageService;

    public User uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose an image to upload");
        if (file.getSize() > MAX_AVATAR_SIZE) throw new IllegalArgumentException("Profile photo must be 2 MB or smaller");
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!IMAGE_TYPES.contains(contentType)) throw new IllegalArgumentException("Use a JPEG, PNG, or WebP profile photo");

        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read the profile photo", exception);
        }
        String extension = contentType.equals("image/png") ? ".png" : contentType.equals("image/webp") ? ".webp" : ".jpg";
        String previousKey = user.getAvatarObjectKey();
        String storageKey = storageService.store("avatar" + extension, content, contentType);
        user.setAvatarObjectKey(storageKey);
        user.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(user);
        if (previousKey != null && !previousKey.isBlank()) storageService.delete(previousKey);
        return saved;
    }

    @Transactional(readOnly = true)
    public byte[] loadAvatar(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getAvatarObjectKey() == null || user.getAvatarObjectKey().isBlank()) {
            throw new IllegalArgumentException("Profile photo not found");
        }
        return storageService.load(user.getAvatarObjectKey());
    }

    @Transactional(readOnly = true)
    public String avatarContentType(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        String key = user.getAvatarObjectKey() == null ? "" : user.getAvatarObjectKey().toLowerCase();
        if (key.endsWith(".png")) return "image/png";
        if (key.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }
}
