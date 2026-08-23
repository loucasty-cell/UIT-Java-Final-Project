package com.skillbridge.forum.application.query;

import com.skillbridge.forum.api.dto.request.ForumSearchQuery;
import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.api.dto.response.ForumPostSummaryResponse;
import com.skillbridge.forum.api.mapper.ForumMapper;
import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.forum.infrastructure.persistence.ForumPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ForumQueryService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumMapper forumMapper;

    public Page<ForumPostSummaryResponse> searchPosts(ForumSearchQuery query) {
        Pageable pageable = PageRequest.of(
            query.getPage() != null ? query.getPage() : 0,
            query.getSize() != null ? query.getSize() : 20
        );

        List<Specification<ForumPost>> specs = new ArrayList<>();
        specs.add((root, query1, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("active")));

        if (query.getQ() != null && !query.getQ().isBlank()) {
            String searchTerm = "%" + query.getQ().toLowerCase() + "%";
            specs.add((root, query1, criteriaBuilder) ->
                criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchTerm)
                )
            );
        }

        if (query.getAuthorId() != null) {
            specs.add((root, query1, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("authorId"), query.getAuthorId())
            );
        }

        Specification<ForumPost> spec = Specification.allOf(specs);
        return postRepository.findAll(spec, pageable)
                .map(forumMapper::toSummaryResponse);
    }

    public ForumPostResponse getPost(UUID postId) {
        return postRepository.findById(postId)
                .map(forumMapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
    }

    public Page<ForumCommentResponse> getComments(UUID postId, Pageable pageable) {
        return commentRepository.findByPostId(postId, pageable)
                .map(forumMapper::toResponse);
    }
}
