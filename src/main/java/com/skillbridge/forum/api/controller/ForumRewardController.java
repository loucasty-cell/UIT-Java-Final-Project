package com.skillbridge.forum.api.controller;

import com.skillbridge.forum.application.command.ForumRewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/forum/comments/{commentId}/mark-helpful")
@RequiredArgsConstructor
public class ForumRewardController {
    private final ForumRewardService forumRewardService;

    @PostMapping
    public ResponseEntity<Void> markHelpful(@PathVariable UUID commentId) {
        forumRewardService.markHelpful(commentId);
        // Note: DTO_CATALOG states this should return PointTransactionResponse.
        // Returning 200 OK void for placeholder mapping, this needs alignment with wallet domain.
        return ResponseEntity.ok().build();
    }
}
