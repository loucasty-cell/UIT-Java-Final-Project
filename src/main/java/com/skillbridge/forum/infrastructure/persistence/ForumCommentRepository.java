package com.skillbridge.forum.infrastructure.persistence;

import com.skillbridge.forum.domain.entity.ForumComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {
    Page<ForumComment> findByPostId(UUID postId, Pageable pageable);
}
