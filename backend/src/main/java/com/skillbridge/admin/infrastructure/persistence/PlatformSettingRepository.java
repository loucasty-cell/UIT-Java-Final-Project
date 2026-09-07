package com.skillbridge.admin.infrastructure.persistence;

import com.skillbridge.admin.domain.entity.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, UUID> {
    Optional<PlatformSetting> findTopByOrderByUpdatedAtDesc();
}
