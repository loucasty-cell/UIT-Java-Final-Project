package com.skillbridge.learningrequest.application.query;

import com.skillbridge.learningrequest.domain.entity.LearningRequest;
import com.skillbridge.learningrequest.infrastructure.persistence.LearningRequestRepository;
import com.skillbridge.shared.error.ScheduleConflictException;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ScheduleConflictService {

    private static final int BUFFER_MINUTES = 15;

    private static final List<SwapSessionStatus> ACTIVE_SESSION_STATUSES = List.of(
            SwapSessionStatus.ACCEPTED,
            SwapSessionStatus.SCHEDULED,
            SwapSessionStatus.STARTED,
            SwapSessionStatus.AWAITING_CONFIRMATION
    );

    private final SwapSessionRepository swapSessionRepository;
    private final LearningRequestRepository learningRequestRepository;

    /**
     * Check for scheduling conflicts for a user.
     * Must be called for BOTH learner and mentor when booking or accepting a session.
     *
     * @param userId user being checked
     * @param scheduledStart proposed start time
     * @param durationMinutes proposed duration in minutes
     * @throws ScheduleConflictException if any conflict with 15-minute buffer exists
     */
    public void validateNoConflict(UUID userId, OffsetDateTime scheduledStart, int durationMinutes) {
        if (scheduledStart == null) {
            return;
        }

        OffsetDateTime scheduledEnd = scheduledStart.plusMinutes(durationMinutes);
        OffsetDateTime bufferStart = scheduledStart.minusMinutes(BUFFER_MINUTES);
        OffsetDateTime bufferEnd = scheduledEnd.plusMinutes(BUFFER_MINUTES);

        // 1. Check existing confirmed/scheduled sessions
        List<SwapSession> conflictingSessions = swapSessionRepository.findConflictingSessions(
                userId,
                bufferStart,
                bufferEnd,
                ACTIVE_SESSION_STATUSES
        );

        if (!conflictingSessions.isEmpty()) {
            SwapSession conflict = conflictingSessions.get(0);
            throw new ScheduleConflictException(
                    "Time slot conflicts with an existing session (with 15-minute buffer).",
                    conflict.getId(),
                    conflict.getScheduledAt(),
                    conflict.getScheduledEnd() != null ? conflict.getScheduledEnd() : conflict.getScheduledAt().plusMinutes(conflict.getDurationMinutes() != null ? conflict.getDurationMinutes() : 60)
            );
        }
    }
}
