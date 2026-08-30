package com.skillbridge.user.application.query;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.user.api.dto.response.DashboardResponse;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.api.mapper.UserMapper;
import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import com.skillbridge.wallet.application.query.WalletQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// DashboardQueryService: Read-only aggregated owner dashboard projection
// Linkage: DashboardController GET /api/v1/me/dashboard -> DashboardQueryService -> UserRepository, WalletQueryService
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DashboardQueryService {

    // Recent-activity window shown on the dashboard
    private static final int RECENT_ACTIVITY_LIMIT = 5;

    private final UserRepository userRepository;

    private final UserProfileQueryService userProfileQueryService;

    private final WalletQueryService walletQueryService;

    private final UserMapper userMapper;

    // Assembles the caller's dashboard: live profile + live wallet data; session, skill, and
    // certificate groups stay empty until their feature slices are implemented
    public DashboardResponse getDashboard(UUID ownerId) {
        // Step 1: Load the account and its safe profile projection
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + ownerId));
        MyProfileResponse profile = userProfileQueryService.toProfileResponse(user);

        // Step 2: Source live wallet balances from the read-only wallet query service
        WalletResponse wallet = walletQueryService.getWallet(ownerId);

        // Step 3: Take the most recent immutable ledger entries for the activity feed
        List<PointTransactionResponse> recentActivity = loadRecentActivity(ownerId, RECENT_ACTIVITY_LIMIT);

        return userMapper.toDashboardResponse(profile, wallet, recentActivity);
    }

    private List<PointTransactionResponse> loadRecentActivity(UUID ownerId, int limit) {
        var page = walletQueryService.getTransactions(
                ownerId,
                null,
                null,
                null,
                PageRequest.of(0, Math.max(limit, 1), Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return page.getContent();
    }
}
