package com.skillbridge.shared.error;

import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
public class ScheduleConflictException extends RuntimeException {

    private final UUID conflictingSessionId;
    private final OffsetDateTime scheduledStart;
    private final OffsetDateTime scheduledEnd;

    public ScheduleConflictException(String message) {
        super(message);
        this.conflictingSessionId = null;
        this.scheduledStart = null;
        this.scheduledEnd = null;
    }

    public ScheduleConflictException(String message, UUID conflictingSessionId, OffsetDateTime scheduledStart, OffsetDateTime scheduledEnd) {
        super(message);
        this.conflictingSessionId = conflictingSessionId;
        this.scheduledStart = scheduledStart;
        this.scheduledEnd = scheduledEnd;
    }
}
