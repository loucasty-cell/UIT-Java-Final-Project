package com.skillbridge.mentor.api.mapper;

import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Mode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MentorMapper {

    public MentorOfferingResponse toResponse(MentorOffering entity) {
        if (entity == null) {
            return null;
        }

        MentorOfferingResponse response = new MentorOfferingResponse();
        response.setId(entity.getId());

        // Stub UserSummaryResponse
        UserSummaryResponse mentor = new UserSummaryResponse();
        mentor.setId(entity.getMentorId());
        // TODO: Populate displayName and other fields once User domain is available
        response.setMentor(mentor);

        // Stub SkillSummaryResponse
        SkillSummaryResponse skill = new SkillSummaryResponse();
        skill.setId(entity.getTeachUserSkillId());
        // TODO: Populate skill details once Skill domain is available
        response.setSkill(skill);

        response.setPrice(entity.getPointCost());

        List<Mode> modes = new ArrayList<>();
        if (Boolean.TRUE.equals(entity.getPointsEnabled())) modes.add(Mode.POINTS);
        if (Boolean.TRUE.equals(entity.getSkillSwapEnabled())) modes.add(Mode.SKILL_SWAP);
        if (Boolean.TRUE.equals(entity.getVolunteerEnabled())) modes.add(Mode.VOLUNTEER);
        response.setModes(modes);

        response.setDuration(entity.getDurationMinutes());
        response.setAvailability(entity.getAvailabilityText());
        response.setActive(entity.getActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }
}
