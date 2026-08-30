/**
 * Frontend schedule conflict detection.
 * Defense-in-depth: backend also validates, but we check client-side
 * to give users immediate feedback before making an API call.
 */

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface SessionLike {
  id?: string;
  scheduledStart: string;
  durationMinutes: number;
  status?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingSession?: SessionLike;
  message?: string;
}

/**
 * Check if a proposed time slot conflicts with any existing session.
 * Applies a configurable buffer (default 15 min) before and after each session
 * to prevent back-to-back bookings.
 *
 * @param newStart - Proposed session start time
 * @param newDurationMinutes - Proposed session duration
 * @param existingSessions - Array of already-booked sessions
 * @param bufferMinutes - Buffer time between sessions (default: 15)
 * @returns ConflictResult with details if a conflict is found
 */
export function checkConflict(
  newStart: Date,
  newDurationMinutes: number,
  existingSessions: SessionLike[],
  bufferMinutes: number = 15,
): ConflictResult {
  const newEnd = new Date(newStart.getTime() + newDurationMinutes * 60 * 1000);

  // Only check against active/scheduled sessions
  const activeStatuses = new Set([
    "SCHEDULED",
    "AWAITING_CONFIRMATION",
    "IN_PROGRESS",
    undefined, // if status not provided, assume active
  ]);

  for (const session of existingSessions) {
    if (session.status && !activeStatuses.has(session.status)) continue;

    const sessionStart = new Date(session.scheduledStart);
    const sessionEnd = new Date(
      sessionStart.getTime() + session.durationMinutes * 60 * 1000,
    );

    // Apply buffer
    const bufferedSessionStart = new Date(
      sessionStart.getTime() - bufferMinutes * 60 * 1000,
    );
    const bufferedSessionEnd = new Date(
      sessionEnd.getTime() + bufferMinutes * 60 * 1000,
    );

    // Two intervals overlap if: start1 < end2 AND start2 < end1
    if (newStart < bufferedSessionEnd && bufferedSessionStart < newEnd) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return {
        hasConflict: true,
        conflictingSession: session,
        message: `Time conflict: You already have a session from ${formatter.format(sessionStart)} to ${formatter.format(sessionEnd)}${bufferMinutes > 0 ? ` (with ${bufferMinutes}-min buffer)` : ""}.`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Combine a date and a time string (e.g. "09:00") into a UTC Date object.
 * Assumes the time is in the user's local timezone.
 */
export function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * Filter mentor availability slots to only those that:
 * 1. Don't conflict with learner's existing sessions
 * 2. Can fit the requested duration
 *
 * @param availableSlots - Mentor's available time windows
 * @param learnerSessions - Learner's existing sessions
 * @param durationMinutes - Required session duration
 * @param bufferMinutes - Buffer between sessions
 * @returns Filtered available slots
 */
export function getAvailableSlots(
  availableSlots: TimeSlot[],
  learnerSessions: SessionLike[],
  durationMinutes: number,
  bufferMinutes: number = 15,
): TimeSlot[] {
  return availableSlots.filter((slot) => {
    const slotDuration =
      (slot.end.getTime() - slot.start.getTime()) / (60 * 1000);

    // Slot must be long enough for the session
    if (slotDuration < durationMinutes) return false;

    // Slot must not conflict with learner's sessions
    const conflict = checkConflict(
      slot.start,
      durationMinutes,
      learnerSessions,
      bufferMinutes,
    );
    return !conflict.hasConflict;
  });
}

/**
 * Validate that a proposed time is in the future.
 */
export function isFutureTime(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Format a time slot for display.
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatter.format(slot.start)} – ${formatter.format(slot.end)}`;
}
