package com.skillbridge.auth.infrastructure.persistence;

import com.skillbridge.auth.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByReferralCode(String referralCode);
    
    /** Batch fetch users by IDs - avoids N+1 queries in mentor search */
    List<User> findAllByIdIn(Collection<UUID> ids);
}
