package com.skillbridge.admin.application.query;

import com.skillbridge.admin.api.dto.response.ReportResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Report;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import com.skillbridge.admin.infrastructure.persistence.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminReportQueryService {

    private final ReportRepository reportRepository;
    private final AdminMapper adminMapper;

    public Page<ReportResponse> getReports(ReportStatus status, ReportTargetType targetType, Pageable pageable) {
        Page<Report> reports;
        if (status != null && targetType != null) {
            reports = reportRepository.findByStatusAndTargetType(status, targetType, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else if (targetType != null) {
            reports = reportRepository.findByTargetType(targetType, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }

        return reports.map(adminMapper::toResponse);
    }
}
