package com.skillbridge.user.api.controller;

import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.application.command.AvatarService;
import com.skillbridge.user.application.query.UserProfileQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AvatarController {
    private final AvatarService avatarService;
    private final UserProfileQueryService userProfileQueryService;

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MyProfileResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userProfileQueryService.toProfileResponse(avatarService.uploadAvatar(file)));
    }

    @GetMapping("/users/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable UUID userId) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(avatarService.avatarContentType(userId)))
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .body(avatarService.loadAvatar(userId));
    }
}
