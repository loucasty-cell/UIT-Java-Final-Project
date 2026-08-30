package com.skillbridge.forum.application.query;

import com.skillbridge.forum.api.dto.response.TopVolunteerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class VolunteerRankingQueryService {

    public Page<TopVolunteerResponse> getTopVolunteers(LocalDate week, Pageable pageable) {
        throw new UnsupportedOperationException("getTopVolunteers requires Session domain implementation to aggregate completed volunteer sessions");
    }
}
