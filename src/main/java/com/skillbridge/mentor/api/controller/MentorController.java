package com.skillbridge.mentor.api.controller;

import com.skillbridge.mentor.api.dto.request.MentorSearchQuery;
import com.skillbridge.mentor.api.dto.response.AvailabilityResponse;
import com.skillbridge.mentor.api.dto.response.MentorDetailResponse;
import com.skillbridge.mentor.api.dto.response.MentorSummaryResponse;
import com.skillbridge.mentor.application.query.AvailabilityQueryService;
import com.skillbridge.mentor.application.query.MentorQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mentors")
@RequiredArgsConstructor
public class MentorController {
    private final MentorQueryService mentorQueryService;
    private final AvailabilityQueryService availabilityQueryService;

    @GetMapping
    public ResponseEntity<Page<MentorSummaryResponse>> getMentors(MentorSearchQuery query) {
        return ResponseEntity.ok(mentorQueryService.searchMentors(query));
    }

    @GetMapping("/{mentorId}")
    public ResponseEntity<MentorDetailResponse> getMentor(@PathVariable UUID mentorId) {
        return ResponseEntity.ok(mentorQueryService.getMentorDetail(mentorId));
    }

    @GetMapping("/{mentorId}/availability")
    public ResponseEntity<AvailabilityResponse> getAvailability(
            @PathVariable UUID mentorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        return ResponseEntity.ok(availabilityQueryService.getAvailability(mentorId, from, to));
    }
}
