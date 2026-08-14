package com.skillbridge.mentor.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Mode;
import lombok.Data;

import java.util.List;

@Data
public class MentorSummaryResponse {
    private UserSummaryResponse user;
    private Double rating;
    private Integer ratingCount;
    private List<Mode> activeModes;
    private List<SkillSummaryResponse> matchingTeachSkills;
    private List<SkillSummaryResponse> wantedSkills;
    private Integer minimumPointCost;
}
