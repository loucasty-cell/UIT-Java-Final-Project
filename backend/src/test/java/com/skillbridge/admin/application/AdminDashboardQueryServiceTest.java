package com.skillbridge.admin.application;

import com.skillbridge.admin.application.query.AdminDashboardQueryService;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import com.skillbridge.admin.infrastructure.persistence.ReportRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class AdminDashboardQueryServiceTest {
    @Test
    void usesPersistedTotalsInsteadOfDemoNumbers() {
        var users = mock(UserRepository.class);
        var wallets = mock(WalletRepository.class);
        var sessions = mock(SwapSessionRepository.class);
        when(users.count()).thenReturn(3L);
        when(wallets.sumHeldPoints()).thenReturn(10L);
        when(sessions.countByStatusIn(anyList())).thenReturn(1L);
        var service = new AdminDashboardQueryService(mock(ReportRepository.class), mock(DisputeRepository.class), users, wallets, sessions);
        var result = service.getDashboardStats();
        assertEquals(3L, result.getTotalUsers());
        assertEquals(10L, result.getHeldEscrowPoints());
        assertEquals(1L, result.getActiveSessions());
    }
}
