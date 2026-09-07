package com.skillbridge.forum.application.command;

import com.skillbridge.admin.domain.entity.PlatformSetting;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.forum.domain.entity.ForumComment;
import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.model.PointEventType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// ForumRewardService: Grants the one-time forum contribution reward for a marked-helpful comment
// Linkage: ForumRewardController -> ForumRewardService -> WalletService.awardOnce() (idempotent ledger award)
@Service
@Transactional
@RequiredArgsConstructor
public class ForumRewardService {

    private final ForumCommentRepository commentRepository;

    // The only financial mutation boundary; the unique idempotency key enforces one award per comment
    private final WalletService walletService;

    // Read access to the seeded platform_settings row owning the contribution reward amount
    private final PlatformSettingRepository platformSettingRepository;

    // Marks a comment helpful and awards the configured points to its author exactly once
    // Linkage: POST /api/v1/forum/comments/{commentId}/helpful -> awardOnce("FORUM_HELPFUL:" + commentId)
    public void markHelpful(UUID commentId) {
        // Step 1: Load the target comment; its author is the reward recipient
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        // Step 2: Grant the server-owned reward amount with a replay-safe idempotency key
        int rewardAmount = loadContributionReward();
        if (rewardAmount > 0) {
            walletService.awardOnce(
                    comment.getAuthorId(),
                    PointEventType.FORUM_REWARD,
                    rewardAmount,
                    "Forum contribution reward",
                    "FORUM_COMMENT",
                    commentId,
                    "FORUM_HELPFUL:" + commentId
            );
        }
    }

    // Reads the server-owned reward amount from platform settings; falls back to 5 when absent
    private int loadContributionReward() {
        return platformSettingRepository.findTopByOrderByUpdatedAtDesc()
                .map(PlatformSetting::getForumContributionReward)
                .orElse(5);
    }
}
