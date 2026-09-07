package com.skillbridge.forum.api.controller;

import com.skillbridge.forum.api.dto.response.ForumEngagementResponse;
import com.skillbridge.forum.application.command.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum/posts/{postId}/like")
@RequiredArgsConstructor
public class ForumLikeController {
    private final ForumService forumService;

    @PutMapping
    public ResponseEntity<ForumEngagementResponse> likePost(@PathVariable UUID postId) {
        return ResponseEntity.ok(forumService.likePost(postId));
    }

    @DeleteMapping
    public ResponseEntity<ForumEngagementResponse> unlikePost(@PathVariable UUID postId) {
        return ResponseEntity.ok(forumService.unlikePost(postId));
    }
}
