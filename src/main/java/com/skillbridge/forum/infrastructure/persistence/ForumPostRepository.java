package com.skillbridge.forum.infrastructure.persistence;

import com.skillbridge.forum.domain.entity.ForumPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, UUID>, JpaSpecificationExecutor<ForumPost> {
    Page<ForumPost> findByActiveTrue(Pageable pageable);
}
