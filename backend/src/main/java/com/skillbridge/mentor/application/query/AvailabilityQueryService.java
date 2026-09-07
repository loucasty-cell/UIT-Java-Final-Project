package com.skillbridge.mentor.application.query;

import com.skillbridge.learningrequest.infrastructure.persistence.LearningRequestRepository;
import com.skillbridge.mentor.api.dto.response.AvailabilityResponse;
import com.skillbridge.mentor.api.dto.response.AvailabilitySlotResponse;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AvailabilityQueryService {

    private static final List<SwapSessionStatus> ACTIVE_STATUSES = List.of(
            SwapSessionStatus.ACCEPTED,
            SwapSessionStatus.SCHEDULED,
            SwapSessionStatus.STARTED,
            SwapSessionStatus.AWAITING_CONFIRMATION
    );

    private final SwapSessionRepository swapSessionRepository;
    private final LearningRequestRepository learningRequestRepository;

    public AvailabilityResponse getAvailability(UUID mentorId, OffsetDateTime from, OffsetDateTime to) {
        OffsetDateTime startTime = (from != null) ? from : OffsetDateTime.now().plusDays(1).truncatedTo(ChronoUnit.HOURS);
        OffsetDateTime endTime = (to != null) ? to : startTime.plusDays(7);

        List<AvailabilitySlotResponse> slots = new ArrayList<>();
        OffsetDateTime cursor = startTime;

        // Generate candidate 1-hour slots between 09:00 and 18:00
        while (cursor.isBefore(endTime)) {
            int hour = cursor.getHour();
            if (hour >= 9 && hour < 18) {
                OffsetDateTime slotStart = cursor;
                OffsetDateTime slotEnd = cursor.plusHours(1);

                // Buffer check
                OffsetDateTime bufferStart = slotStart.minusMinutes(15);
                OffsetDateTime bufferEnd = slotEnd.plusMinutes(15);

                List<SwapSession> conflicts = swapSessionRepository.findConflictingSessions(
                        mentorId,
                        bufferStart,
                        bufferEnd,
                        ACTIVE_STATUSES
                );

                if (conflicts.isEmpty()) {
                    slots.add(new AvailabilitySlotResponse(slotStart, slotEnd));
                }
            }
            cursor = cursor.plusHours(1);
        }

        return AvailabilityResponse.builder()
                .mentorId(mentorId)
                .availableSlots(slots)
                .build();
    }
}
