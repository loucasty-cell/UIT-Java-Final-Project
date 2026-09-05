package com.skillbridge.forum.application.command;

import com.skillbridge.forum.api.dto.request.ForumCommentCreateRequest;
import com.skillbridge.forum.api.dto.request.ForumPostCreateRequest;
import com.skillbridge.forum.api.dto.request.ForumPostUpdateRequest;
import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.api.dto.response.ForumEngagementResponse;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.api.mapper.ForumMapper;
import com.skillbridge.forum.domain.entity.ForumComment;
import com.skillbridge.forum.domain.entity.ForumLike;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import com.skillbridge.forum.infrastructure.persistence.ForumLikeRepository;
import com.skillbridge.forum.infrastructure.persistence.ForumPostRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.skill.infrastructure.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumLikeRepository forumLikeRepository;
    private final ForumMapper forumMapper;
    private final NotificationService notificationService;
    private final SkillRepository skillRepository;

    public ForumPostResponse createPost(ForumPostCreateRequest request) {
        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();

        ForumPost entity = new ForumPost();
        entity.setId(UUID.randomUUID());
        entity.setAuthorId(currentUserId);
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        validateSkills(request.getSkillIds());
        entity.setSkillIds(new java.util.LinkedHashSet<>(request.getSkillIds()));
        entity.setAvailabilityText(request.getAvailabilityText());
        entity.setDurationMinutes(request.getDurationMinutes());
        entity.setActive(request.getActive() != null ? request.getActive() : true);
        entity.setLikeCount(0);
        entity.setCommentCount(0);
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());

        return forumMapper.toResponse(postRepository.save(entity));
    }

    public ForumPostResponse updatePost(UUID postId, ForumPostUpdateRequest request) {
        ForumPost entity = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        if (!entity.getAuthorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update another user's post");
        }

        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getSkillIds() != null) {
            validateSkills(request.getSkillIds());
            entity.setSkillIds(new java.util.LinkedHashSet<>(request.getSkillIds()));
        }
        if (request.getAvailabilityText() != null) entity.setAvailabilityText(request.getAvailabilityText());
        if (request.getDurationMinutes() != null) entity.setDurationMinutes(request.getDurationMinutes());
        if (request.getActive() != null) entity.setActive(request.getActive());

        entity.setUpdatedAt(OffsetDateTime.now());
        return forumMapper.toResponse(postRepository.save(entity));
    }

    public void deletePost(UUID postId) {
        ForumPost entity = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        if (!entity.getAuthorId().equals(currentUserId)) {
            // Admin bypass would ideally be checked here via SecurityContext roles, simplified for now
            throw new org.springframework.security.access.AccessDeniedException("Cannot delete another user's post");
        }

        // Soft delete per requirements
        entity.setActive(false);
        postRepository.save(entity);
    }

    public ForumEngagementResponse likePost(UUID postId) {
        ForumPost entity = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();

        if (!forumLikeRepository.existsByPostIdAndUserId(postId, currentUserId)) {
            ForumLike like = new ForumLike();
            like.setId(UUID.randomUUID());
            like.setPostId(postId);
            like.setUserId(currentUserId);
            like.setCreatedAt(OffsetDateTime.now());
            forumLikeRepository.save(like);

            entity.setLikeCount(entity.getLikeCount() + 1);
            postRepository.save(entity);
        }

        ForumEngagementResponse response = new ForumEngagementResponse();
        response.setPostId(postId);
        response.setLikeCount(entity.getLikeCount());
        response.setCommentCount(entity.getCommentCount());
        response.setLikedByMe(true);
        return response;
    }

    public ForumEngagementResponse unlikePost(UUID postId) {
        ForumPost entity = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();

        forumLikeRepository.findByPostIdAndUserId(postId, currentUserId).ifPresent(like -> {
            forumLikeRepository.delete(like);
            if (entity.getLikeCount() > 0) {
                entity.setLikeCount(entity.getLikeCount() - 1);
                postRepository.save(entity);
            }
        });

        ForumEngagementResponse response = new ForumEngagementResponse();
        response.setPostId(postId);
        response.setLikeCount(entity.getLikeCount());
        response.setCommentCount(entity.getCommentCount());
        response.setLikedByMe(false);
        return response;
    }

    public ForumCommentResponse addComment(UUID postId, ForumCommentCreateRequest request) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();

        ForumComment comment = new ForumComment();
        comment.setId(UUID.randomUUID());
        comment.setPostId(postId);
        comment.setAuthorId(currentUserId);
        comment.setBody(request.getBody());
        comment.setCreatedAt(OffsetDateTime.now());
        comment.setUpdatedAt(OffsetDateTime.now());

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        ForumComment saved = commentRepository.save(comment);
        if (!post.getAuthorId().equals(currentUserId)) {
            notificationService.notifyForumCommentReply(post.getAuthorId(), saved.getId());
        }
        return forumMapper.toResponse(saved);
    }

    public void deleteComment(UUID commentId) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot delete another user's comment");
        }

        ForumPost post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        // Soft-delete: actual implementation might clear the body or have an active flag
        // Here we do hard delete for brevity as there is no active flag in DTO spec for comments
        commentRepository.delete(comment);

        if (post.getCommentCount() > 0) {
            post.setCommentCount(post.getCommentCount() - 1);
            postRepository.save(post);
        }
    }

    private void validateSkills(java.util.List<UUID> skillIds) {
        if (skillIds.stream().anyMatch(id -> !skillRepository.existsById(id))) {
            throw new IllegalArgumentException("Every post skill must exist in the skill catalog");
        }
    }
}
