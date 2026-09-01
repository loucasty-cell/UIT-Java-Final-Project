package com.skillbridge.user.application.query;

/**
 * DashboardConstants: Constants for dashboard calculations
 * Linkage: Used by DashboardQueryService for metrics and engagement calculations
 */
public final class DashboardConstants {
    private DashboardConstants() {
    }

    // Recent activity window shown on the dashboard
    public static final int RECENT_ACTIVITY_LIMIT = 5;

    // Default session duration when not specified
    public static final int DEFAULT_SESSION_DURATION_MINUTES = 60;

    // Session count for full progress percentage (100%)
    public static final int SESSIONS_FOR_FULL_PROGRESS = 10;

    // Progress increment per completed session (1%)
    public static final int PROGRESS_INCREMENT_PER_SESSION = 10;

    // Base progress percentages by proficiency level
    public static final int PROGRESS_BASE_ADVANCED = 65;
    public static final int PROGRESS_BASE_INTERMEDIATE = 35;
    public static final int PROGRESS_BASE_BEGINNER = 15;

    // Progress ceiling (cannot exceed)
    public static final int PROGRESS_MAX_PERCENTAGE = 100;
}
