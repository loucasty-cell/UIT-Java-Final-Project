package com.skillbridge.wallet.domain.model;

// PointEventType: Closed vocabulary of point movements recorded in the immutable point_ledger
// Linkage: Written by WalletService (the only financial mutation boundary) on every balance change
public enum PointEventType {

    // One-time +N award right after successful registration (registration_bonus platform setting)
    REGISTRATION_BONUS,

    // One-time +5 reward for a marked-helpful forum comment (forum_contribution_reward setting)
    FORUM_REWARD,

    // Admin-driven manual adjustment with signed delta and reason
    ADMIN_ADJUSTMENT,

    // POINTS learning request accepted: moves points from available into held escrow
    POINTS_HOLD,

    // Session completion: releases held points to the mentor
    POINTS_RELEASE,

    // Rejection, cancellation, expiry, or dispute refund: returns held points to the learner
    POINTS_REFUND,

    // +5 for mentor after volunteer session completed
    VOLUNTEER_REWARD,

    // +3 for submitting a session review
    REVIEW_REWARD,

    // +5 when referred user registers
    REFERRAL_BONUS,

    // +5 to +10 for reaching milestone achievements
    MILESTONE_BONUS,

    // Direct student-to-student transfer
    POINT_TRANSFER
}
