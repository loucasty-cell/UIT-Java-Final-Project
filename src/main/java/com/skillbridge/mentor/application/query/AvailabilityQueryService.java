package com.skillbridge.mentor.application.query;

import com.skillbridge.mentor.api.dto.response.AvailabilityResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AvailabilityQueryService {
    public AvailabilityResponse getAvailability(UUID mentorId, OffsetDateTime from, OffsetDateTime to) {
        AvailabilityResponse response = new AvailabilityResponse();
        response.setMentorId(mentorId);
        response.setAvailableSlots(Collections.emptyList());
        return response;
    }
}
