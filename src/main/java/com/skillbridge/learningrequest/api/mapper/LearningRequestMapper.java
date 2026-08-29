package com.skillbridge.learningrequest.api.mapper;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.learningrequest.api.dto.response.LearningRequestResponse;
import com.skillbridge.learningrequest.domain.entity.LearningRequest;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.skill.domain.entity.Skill;
import org.springframework.stereotype.Component;

@Component
public class LearningRequestMapper {

    public LearningRequestResponse toResponse(LearningRequest entity, User learner, User mentor, Skill requestedSkill) {
        if (entity == null) {
            return null;
        }

        String learnerName = learner != null ? (learner.getFirstName() + " " + learner.getLastName()).trim() : null;
        String mentorName = mentor != null ? (mentor.getFirstName() + " " + mentor.getLastName()).trim() : null;

        SkillSummaryResponse skillSummary = null;
        if (requestedSkill != null) {
            skillSummary = SkillSummaryResponse.builder()
                    .id(requestedSkill.getId())
                    .name(requestedSkill.getName())
                    .category(requestedSkill.getCategory())
                    .build();
        }

        return LearningRequestResponse.builder()
                .id(entity.getId())
                .learnerId(entity.getLearnerId())
                .learnerName(learnerName)
                .mentorId(entity.getMentorId())
                .mentorName(mentorName)
                .mentorOfferingId(entity.getMentorOfferingId())
                .requestedSkill(skillSummary)
                .offeredUserSkillId(entity.getOfferedUserSkillId())
                .sourceForumPostId(entity.getSourceForumPostId())
                .mode(entity.getMode())
                .pointCost(entity.getPointCost())
                .pointsHeld(entity.getPointsHeld())
                .scheduledStart(entity.getScheduledStart())
                .durationMinutes(entity.getDurationMinutes())
                .message(entity.getMessage())
                .status(entity.getStatus())
                .sessionId(entity.getSessionId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
