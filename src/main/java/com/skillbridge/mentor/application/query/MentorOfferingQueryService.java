package com.skillbridge.mentor.application.query;

import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.api.mapper.MentorMapper;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MentorOfferingQueryService {
    private final MentorOfferingRepository offeringRepository;
    private final MentorMapper mentorMapper;

    public Page<MentorOfferingResponse> getOfferings(UUID mentorId, Pageable pageable) {
        return offeringRepository.findByMentorId(mentorId, pageable)
                .map(mentorMapper::toResponse);
    }
}
