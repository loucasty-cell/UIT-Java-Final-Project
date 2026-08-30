package com.skillbridge.admin.infrastructure.persistence;

import com.skillbridge.admin.domain.entity.AccountWarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountWarningRepository extends JpaRepository<AccountWarning, UUID> {
    List<AccountWarning> findByUserId(UUID userId);
    long countByUserId(UUID userId);
}
