package com.skillbridge.learningrequest.application;

import com.skillbridge.learningrequest.application.query.ScheduleConflictService;
import com.skillbridge.learningrequest.infrastructure.persistence.LearningRequestRepository;
import com.skillbridge.shared.error.ScheduleConflictException;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

public class ScheduleConflictServiceTest {

    private SwapSessionRepository swapSessionRepository;
    private LearningRequestRepository learningRequestRepository;
    private ScheduleConflictService conflictService;

    private final UUID mentorId = UUID.randomUUID();
    private final OffsetDateTime baseTime = OffsetDateTime.parse("2026-09-01T10:00:00Z");

    @BeforeEach
    void setUp() {
        swapSessionRepository = Mockito.mock(SwapSessionRepository.class);
        learningRequestRepository = Mockito.mock(LearningRequestRepository.class);
        conflictService = new ScheduleConflictService(swapSessionRepository, learningRequestRepository);
    }

    @Test
    void hasNoConflictWhenNoSessionsExist() {
        when(swapSessionRepository.findConflictingSessions(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> conflictService.validateNoConflict(mentorId, baseTime, 60));
    }

    @Test
    void detectsConflictWhenSessionOverlapsWithin15MinuteBuffer() {
        SwapSession activeSession = new SwapSession();
        activeSession.setId(UUID.randomUUID());
        activeSession.setScheduledAt(baseTime.minusMinutes(30));
        activeSession.setDurationMinutes(60); // Ends at 10:30, buffer extends to 10:45
        activeSession.setStatus(SwapSessionStatus.SCHEDULED);

        when(swapSessionRepository.findConflictingSessions(eq(mentorId), any(), any(), any()))
                .thenReturn(List.of(activeSession));

        assertThrows(ScheduleConflictException.class,
                () -> conflictService.validateNoConflict(mentorId, baseTime, 60));
    }
}
