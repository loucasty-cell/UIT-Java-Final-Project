package com.skillbridge.forum.api.dto.response;

import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Data;

@Data
public class TopVolunteerResponse {
    private UserSummaryResponse user;
    private Integer completedSessions;
    private Integer rank;
}
