package com.skillbridge.user.infrastructure.persistence;

import com.skillbridge.user.domain.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, UUID> {

    List<UserActivityLog> findByUserIdOrderByActivityDateDesc(UUID userId);

    Optional<UserActivityLog> findByUserIdAndActivityDate(UUID userId, LocalDate activityDate);
}
