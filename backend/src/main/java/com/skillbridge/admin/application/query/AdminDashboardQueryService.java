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
    private final com.skillbridge.auth.infrastructure.persistence.UserRepository userRepository;
    private final com.skillbridge.wallet.infrastructure.persistence.WalletRepository walletRepository;
    private final com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository sessionRepository;

    public AdminDashboardResponse getDashboardStats() {
        long openReports = reportRepository.countByStatus(ReportStatus.OPEN);
        long activeDisputes = disputeRepository.countByStatus(DisputeStatus.OPEN);

        return AdminDashboardResponse.builder()
                .totalUsers(userRepository.count())
                .heldEscrowPoints(walletRepository.sumHeldPoints())
                .openReports(openReports)
                .activeDisputes(activeDisputes)
                .activeSessions(sessionRepository.countByStatusIn(java.util.List.of(
                        com.skillbridge.swap.domain.model.SwapSessionStatus.ACCEPTED,
                        com.skillbridge.swap.domain.model.SwapSessionStatus.SCHEDULED,
                        com.skillbridge.swap.domain.model.SwapSessionStatus.STARTED)))
                .build();
    }
}
