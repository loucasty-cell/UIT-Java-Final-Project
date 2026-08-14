package com.skillbridge.forum.api.controller;

import com.skillbridge.forum.api.dto.request.ForumCommentCreateRequest;
import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.application.command.ForumService;
import com.skillbridge.forum.application.query.ForumQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumCommentController {
    private final ForumService forumService;
    private final ForumQueryService forumQueryService;

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<ForumCommentResponse>> getComments(@PathVariable UUID postId, Pageable pageable) {
        return ResponseEntity.ok(forumQueryService.getComments(postId, pageable));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ForumCommentResponse> addComment(@PathVariable UUID postId, @Valid @RequestBody ForumCommentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.addComment(postId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        forumService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
