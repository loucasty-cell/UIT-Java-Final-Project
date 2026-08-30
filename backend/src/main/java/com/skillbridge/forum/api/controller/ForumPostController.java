package com.skillbridge.forum.api.controller;

import com.skillbridge.forum.api.dto.request.ForumPostCreateRequest;
import com.skillbridge.forum.api.dto.request.ForumPostUpdateRequest;
import com.skillbridge.forum.api.dto.request.ForumSearchQuery;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.api.dto.response.ForumPostSummaryResponse;
import com.skillbridge.forum.api.dto.response.TopVolunteerResponse;
import com.skillbridge.forum.application.command.ForumService;
import com.skillbridge.forum.application.query.ForumQueryService;
import com.skillbridge.forum.application.query.VolunteerRankingQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum")
@RequiredArgsConstructor
public class ForumPostController {
    private final ForumService forumService;
    private final ForumQueryService forumQueryService;
    private final VolunteerRankingQueryService volunteerRankingQueryService;

    @GetMapping("/posts")
    public ResponseEntity<Page<ForumPostSummaryResponse>> searchPosts(ForumSearchQuery query) {
        return ResponseEntity.ok(forumQueryService.searchPosts(query));
    }

    @PostMapping("/posts")
    public ResponseEntity<ForumPostResponse> createPost(@Valid @RequestBody ForumPostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createPost(request));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<ForumPostResponse> getPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(forumQueryService.getPost(postId));
    }

    @PatchMapping("/posts/{postId}")
    public ResponseEntity<ForumPostResponse> updatePost(@PathVariable UUID postId, @Valid @RequestBody ForumPostUpdateRequest request) {
        return ResponseEntity.ok(forumService.updatePost(postId, request));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable UUID postId) {
        forumService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/top-volunteers")
    public ResponseEntity<Page<TopVolunteerResponse>> getTopVolunteers(@RequestParam LocalDate week, Pageable pageable) {
        return ResponseEntity.ok(volunteerRankingQueryService.getTopVolunteers(week, pageable));
    }
}
