package com.skillbridge.auth.infrastructure.persistence;

import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.domain.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(UUID userId);

    List<UserRole> findByRole(String role);

    boolean existsByUserIdAndRole(UUID userId, String role);
}
