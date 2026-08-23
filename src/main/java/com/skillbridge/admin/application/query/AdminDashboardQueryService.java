package com.skillbridge.admin.application.query;

import com.skillbridge.admin.api.dto.response.AdminDashboardResponse;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.admin.infrastructure.persistence.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminDashboardQueryService {

    private final ReportRepository reportRepository;
    private final DisputeRepository disputeRepository;

    public AdminDashboardResponse getDashboardStats() {
        long openReports = reportRepository.countByStatus(ReportStatus.OPEN);
        long activeDisputes = disputeRepository.countByStatus(DisputeStatus.OPEN);

        return AdminDashboardResponse.builder()
                .totalUsers(1240L)
                .heldEscrowPoints(3500L)
                .openReports(openReports)
                .activeDisputes(activeDisputes)
                .activeSessions(8L)
                .build();
    }
}
