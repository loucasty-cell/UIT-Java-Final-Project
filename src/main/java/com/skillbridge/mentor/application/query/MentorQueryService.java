package com.skillbridge.mentor.application.query;

import com.skillbridge.mentor.api.dto.request.MentorSearchQuery;
import com.skillbridge.mentor.api.dto.response.MentorDetailResponse;
import com.skillbridge.mentor.api.dto.response.MentorSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MentorQueryService {
    public Page<MentorSummaryResponse> searchMentors(MentorSearchQuery query) {
        throw new UnsupportedOperationException("searchMentors requires User and Role domain implementation for complex queries/joins");
    }

    public MentorDetailResponse getMentorDetail(UUID mentorId) {
        throw new UnsupportedOperationException("getMentorDetail requires User and Skill domain implementation to fetch aggregated summaries");
    }
}
