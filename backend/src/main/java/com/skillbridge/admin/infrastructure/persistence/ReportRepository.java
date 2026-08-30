package com.skillbridge.admin.infrastructure.persistence;

import com.skillbridge.admin.domain.entity.Report;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Page<Report> findByStatusAndTargetType(ReportStatus status, ReportTargetType targetType, Pageable pageable);
    Page<Report> findByTargetType(ReportTargetType targetType, Pageable pageable);
    long countByStatus(ReportStatus status);
    List<Report> findAllByOrderByCreatedAtDesc();
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
}
