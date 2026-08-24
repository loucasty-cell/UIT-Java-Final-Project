package com.skillbridge.wallet.application.command;

import com.skillbridge.wallet.domain.entity.Escrow;
import com.skillbridge.wallet.domain.entity.PointTransaction;
import com.skillbridge.wallet.domain.entity.Wallet;
import com.skillbridge.wallet.domain.model.EscrowStatus;
import com.skillbridge.wallet.domain.model.PointEventType;
import com.skillbridge.wallet.infrastructure.persistence.EscrowRepository;
import com.skillbridge.wallet.infrastructure.persistence.PointTransactionRepository;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

// WalletService: The ONLY financial mutation boundary of the platform
// Linkage: RegistrationService, ForumRewardService, AdminUserController, future request/session slices -> WalletService -> WalletRepository, PointTransactionRepository, EscrowRepository
//
// Guarantees enforced here for every operation:
// - Atomic: balance change + immutable ledger row (+ escrow row) happen in one transaction
// - Idempotent: a unique idempotency key makes retries safe; replays are silently ignored
// - Serialized: the wallet row is pessimistically locked so concurrent commands cannot interleave
@Service
@Transactional
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;

    private final PointTransactionRepository pointTransactionRepository;

    private final EscrowRepository escrowRepository;

    // Creates the zeroed starter wallet exactly once during registration onboarding
    // Linkage: Called by RegistrationService after user + role insert
    public void createWalletForRegistration(UUID userId) {
        ensureWallet(userId);
    }

    // Returns the wallet for the user, creating an empty one for legacy accounts that predate V5
    public Wallet ensureWallet(UUID userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            OffsetDateTime now = OffsetDateTime.now();
            Wallet wallet = new Wallet();
            wallet.setId(UUID.randomUUID());
            wallet.setUserId(userId);
            wallet.setAvailablePoints(0);
            wallet.setHeldPoints(0);
            wallet.setTotalEarned(0);
            wallet.setTotalSpent(0);
            wallet.setCreatedAt(now);
            wallet.setUpdatedAt(now);
            return walletRepository.save(wallet);
        });
    }

    // Grants a one-time award guarded by a unique idempotency key (registration bonus, forum reward)
    // Linkage: RegistrationService ("REG:" + userId), ForumRewardService ("FORUM_HELPFUL:" + commentId)
    public void awardOnce(
            UUID userId,
            PointEventType eventType,
            int amount,
            String description,
            String referenceType,
            UUID referenceId,
            String idempotencyKey
    ) {
        // Step 1: Replay check - if the ledger already holds this key the award was granted before
        if (isAlreadyProcessed(idempotencyKey)) {
            return;
        }

        // Step 2: Lock the wallet row and apply the positive delta to available points
        Wallet wallet = lockWallet(userId);
        if (amount <= 0) {
            throw new IllegalArgumentException("Award amount must be positive");
        }
        wallet.setAvailablePoints(wallet.getAvailablePoints() + amount);
        wallet.setTotalEarned(wallet.getTotalEarned() + amount);

        // Step 3: Append the immutable ledger entry inside the same transaction
        appendLedgerEntry(wallet, eventType, amount, 0, description, referenceType, referenceId, idempotencyKey);
    }

    // Moves points from the learner's available balance into held escrow for one learning request
    // Linkage: Future LearningRequestService (POINTS mode accept flow); creates the HELD escrow row
    public void holdPoints(
            UUID learnerId,
            UUID mentorId,
            int amount,
            String referenceType,
            UUID referenceId,
            String idempotencyKey
    ) {
        if (isAlreadyProcessed(idempotencyKey)) {
            return;
        }
        validatePositiveAmount(amount);

        // Step 1: Lock the learner wallet and verify sufficient freely spendable points
        Wallet learnerWallet = lockWallet(learnerId);
        if (learnerWallet.getAvailablePoints() < amount) {
            throw new IllegalArgumentException("Insufficient available points");
        }

        // Step 2: Move the amount from available into held
        learnerWallet.setAvailablePoints(learnerWallet.getAvailablePoints() - amount);
        learnerWallet.setHeldPoints(learnerWallet.getHeldPoints() + amount);

        // Step 3: Record the HELD escrow for later release or refund
        OffsetDateTime now = OffsetDateTime.now();
        Escrow escrow = new Escrow();
        escrow.setId(UUID.randomUUID());
        escrow.setLearnerId(learnerId);
        escrow.setMentorId(mentorId);
        escrow.setReferenceType(referenceType);
        escrow.setReferenceId(referenceId);
        escrow.setAmount(amount);
        escrow.setStatus(EscrowStatus.HELD);
        escrow.setCreatedAt(now);
        escrow.setUpdatedAt(now);
        escrowRepository.save(escrow);

        // Step 4: Ledger entry records both signed deltas (available down, held up)
        appendLedgerEntry(learnerWallet, PointEventType.POINTS_HOLD, -amount, amount,
                "Points held for " + referenceType, referenceType, referenceId, idempotencyKey);
    }

    // Releases held points from the learner to the mentor exactly once upon session completion
    // Linkage: Future SessionCompletionService / auto-release scheduled job
    public void releaseHeldPoints(
            UUID learnerId,
            UUID mentorId,
            String referenceType,
            UUID referenceId,
            String idempotencyKey
    ) {
        if (isAlreadyProcessed(idempotencyKey)) {
            return;
        }

        // Step 1: The open HELD escrow is authoritative for the released amount
        Escrow escrow = openEscrow(referenceType, referenceId);
        int amount = escrow.getAmount();

        // Step 2: Take back the held points from the learner wallet
        Wallet learnerWallet = lockWallet(learnerId);
        learnerWallet.setHeldPoints(learnerWallet.getHeldPoints() - amount);
        learnerWallet.setTotalSpent(learnerWallet.getTotalSpent() + amount);

        // Step 3: Credit the mentor wallet with earned points
        Wallet mentorWallet = lockWallet(mentorId);
        mentorWallet.setAvailablePoints(mentorWallet.getAvailablePoints() + amount);
        mentorWallet.setTotalEarned(mentorWallet.getTotalEarned() + amount);

        // Step 4: Close the escrow and write both ledger entries in the same transaction
        closeEscrow(escrow, EscrowStatus.RELEASED);
        appendLedgerEntry(learnerWallet, PointEventType.POINTS_RELEASE, 0, -amount,
                "Points released to mentor", referenceType, referenceId, idempotencyKey + ":LEARNER");
        appendLedgerEntry(mentorWallet, PointEventType.POINTS_RELEASE, amount, 0,
                "Points received from session", referenceType, referenceId, idempotencyKey + ":MENTOR");
    }

    // Returns held points to the learner's available balance exactly once (reject/cancel/expiry/dispute refund)
    // Linkage: Future LearningRequestService reject/cancel flows and dispute REFUND_LEARNER resolution
    public void refundHeldPoints(
            UUID learnerId,
            String referenceType,
            UUID referenceId,
            String idempotencyKey
    ) {
        if (isAlreadyProcessed(idempotencyKey)) {
            return;
        }

        // Step 1: The open HELD escrow is authoritative for the refunded amount
        Escrow escrow = openEscrow(referenceType, referenceId);
        int amount = escrow.getAmount();

        // Step 2: Move the held points back to available on the learner wallet
        Wallet learnerWallet = lockWallet(learnerId);
        learnerWallet.setHeldPoints(learnerWallet.getHeldPoints() - amount);
        learnerWallet.setAvailablePoints(learnerWallet.getAvailablePoints() + amount);

        // Step 3: Close the escrow as refunded and record the movement
        closeEscrow(escrow, EscrowStatus.REFUNDED);
        appendLedgerEntry(learnerWallet, PointEventType.POINTS_REFUND, amount, -amount,
                "Refund of held points", referenceType, referenceId, idempotencyKey);
    }

    // Applies a signed admin adjustment (-10000..10000, never zero) with a mandatory reason
    // Linkage: AdminUserController POST /api/v1/admin/users/{userId}/wallet-adjustments
    public void adjust(UUID targetUserId, int delta, String reason) {
        if (delta == 0) {
            throw new IllegalArgumentException("Adjustment delta must not be zero");
        }
        if (delta < -10000 || delta > 10000) {
            throw new IllegalArgumentException("Adjustment delta must be between -10000 and 10000");
        }

        // Step 1: Lock the wallet; a negative delta must not push available below zero
        Wallet wallet = lockWallet(targetUserId);
        int newBalance = wallet.getAvailablePoints() + delta;
        if (newBalance < 0) {
            throw new IllegalArgumentException("Adjustment would make available points negative");
        }

        // Step 2: Apply the delta and keep lifetime totals consistent
        wallet.setAvailablePoints(newBalance);
        if (delta > 0) {
            wallet.setTotalEarned(wallet.getTotalEarned() + delta);
        }

        // Step 3: Append the ADMIN_ADJUSTMENT ledger entry with the reason as description
        appendLedgerEntry(wallet, PointEventType.ADMIN_ADJUSTMENT, delta, 0,
                reason, "ADMIN", null, null);
    }

    // --- internal helpers ---

    // Loads the wallet with a pessimistic write lock so concurrent financial commands serialize
    private Wallet lockWallet(UUID userId) {
        return walletRepository.findWithLockByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + userId));
    }

    // True when a ledger row already exists for the retry key; makes commands replay-safe
    private boolean isAlreadyProcessed(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return false;
        }
        return pointTransactionRepository.findByIdempotencyKey(idempotencyKey).isPresent();
    }

    // Appends one immutable ledger row snapshotting balances immediately after the applied deltas
    private void appendLedgerEntry(
            Wallet wallet,
            PointEventType eventType,
            int availableDelta,
            int heldDelta,
            String description,
            String referenceType,
            UUID referenceId,
            String idempotencyKey
    ) {
        PointTransaction transaction = new PointTransaction();
        transaction.setId(UUID.randomUUID());
        transaction.setWalletId(wallet.getId());
        transaction.setUserId(wallet.getUserId());
        transaction.setEventType(eventType);
        transaction.setAvailableDelta(availableDelta);
        transaction.setHeldDelta(heldDelta);
        transaction.setBalanceAfterAvailable(wallet.getAvailablePoints());
        transaction.setBalanceAfterHeld(wallet.getHeldPoints());
        transaction.setDescription(description);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setIdempotencyKey(idempotencyKey);
        transaction.setCreatedAt(OffsetDateTime.now());
        pointTransactionRepository.save(transaction);

        wallet.setUpdatedAt(OffsetDateTime.now());
        walletRepository.save(wallet);
    }

    // Finds the single open escrow for a reference; its absence means nothing is held to settle
    private Escrow openEscrow(String referenceType, UUID referenceId) {
        return escrowRepository
                .findByReferenceTypeAndReferenceIdAndStatus(referenceType, referenceId, EscrowStatus.HELD)
                .orElseThrow(() -> new IllegalStateException("No open escrow for " + referenceType + ": " + referenceId));
    }

    // Transitions an escrow to a terminal state exactly once
    private void closeEscrow(Escrow escrow, EscrowStatus terminalStatus) {
        escrow.setStatus(terminalStatus);
        escrow.setUpdatedAt(OffsetDateTime.now());
        escrowRepository.save(escrow);
    }

    private void validatePositiveAmount(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Point amount must be positive");
        }
    }
}
