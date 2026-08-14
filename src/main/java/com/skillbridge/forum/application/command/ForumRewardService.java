package com.skillbridge.forum.application.command;

import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ForumRewardService {

    private final ForumCommentRepository commentRepository;

    public void markHelpful(UUID commentId) {
        commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));
        // Further integration with wallet required
    }
}
