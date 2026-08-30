package com.skillbridge.mentor.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.Data;

import java.util.List;

@Data
public class MentorDetailResponse {
    private UserSummaryResponse user;
    private List<MentorOfferingResponse> activeOfferings;
    private List<SkillSummaryResponse> allVisibleTeachSkills;
    private List<SkillSummaryResponse> allVisibleLearnSkills;
    private Double rating;
    private Integer ratingCount;
}
