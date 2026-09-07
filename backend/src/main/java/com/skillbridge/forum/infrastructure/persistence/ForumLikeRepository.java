package com.skillbridge.forum.infrastructure.persistence;

import com.skillbridge.forum.domain.entity.ForumLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForumLikeRepository extends JpaRepository<ForumLike, UUID> {
    Optional<ForumLike> findByPostIdAndUserId(UUID postId, UUID userId);
    boolean existsByPostIdAndUserId(UUID postId, UUID userId);
}
