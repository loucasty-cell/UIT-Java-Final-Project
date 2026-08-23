package com.skillbridge.user.api.dto.response;

import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

// DashboardResponse: Aggregated owner dashboard projection
// Linkage: Built by UserMapper + DashboardQueryService; areas of features not yet implemented stay empty
@Getter
@Builder
@AllArgsConstructor
public class DashboardResponse {

    // Compact profile summary block
    private final MyProfileResponse profile;

    // Live wallet balances from the wallet slice
    private final WalletResponse wallet;

    private final Long completedSessionCount;

    private final Long mentorSessionCount;

    private final Long learnerSessionCount;

    // Upcoming sessions owned by the future session slice; empty until it lands
    private final List<UpcomingSessionSummary> nextSessions;

    // Visible TEACH skills owned by the future skills slice; empty until it lands
    private final List<SkillTagSummary> teachSkills;

    // Visible LEARN skills owned by the future skills slice; empty until it lands
    private final List<SkillTagSummary> learnSkills;

    // Certificates owned by the future certificates slice; empty until it lands
    private final List<CertificateSummary> certificates;

    // Most recent immutable point activity, sourced live from the wallet ledger
    private final List<PointTransactionResponse> recentActivity;

    // Minimal upcoming-session shape reserved for the session feature slice
    @Getter
    @Builder
    @AllArgsConstructor
    public static class UpcomingSessionSummary {

        private final java.util.UUID sessionId;

        private final String requestedSkillName;

        private final String mode;

        private final String status;

        private final OffsetDateTime scheduledStart;
    }

    // Minimal skill-tag shape shared by teach and learn groupings
    @Getter
    @Builder
    @AllArgsConstructor
    public static class SkillTagSummary {

        private final java.util.UUID skillId;

        private final String skillName;
    }

    // Minimal certificate shape reserved for the certificates feature slice
    @Getter
    @Builder
    @AllArgsConstructor
    public static class CertificateSummary {

        private final java.util.UUID certificateId;

        private final String displayName;

        private final OffsetDateTime createdAt;
    }
}
