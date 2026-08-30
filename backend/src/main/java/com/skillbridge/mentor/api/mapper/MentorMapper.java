package com.skillbridge.mentor.api.mapper;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Mode;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MentorMapper {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public MentorOfferingResponse toResponse(MentorOffering entity) {
        if (entity == null) {
            return null;
        }

        MentorOfferingResponse response = new MentorOfferingResponse();
        response.setId(entity.getId());
        response.setMentor(toUserSummary(entity.getMentorId(), true));
        response.setSkill(toSkillSummary(entity.getTeachUserSkillId()));

        response.setPrice(entity.getPointCost());

        List<Mode> modes = new ArrayList<>();
        if (Boolean.TRUE.equals(entity.getPointsEnabled()))
            modes.add(Mode.POINTS);
        if (Boolean.TRUE.equals(entity.getSkillSwapEnabled()))
            modes.add(Mode.SKILL_SWAP);
        if (Boolean.TRUE.equals(entity.getVolunteerEnabled()))
            modes.add(Mode.VOLUNTEER);
        response.setModes(modes);

        response.setDuration(entity.getDurationMinutes());
        response.setAvailability(entity.getAvailabilityText());
        response.setActive(entity.getActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }

    public UserSummaryResponse toUserSummary(UUID userId, boolean mentorBadge) {
        UserSummaryResponse summary = new UserSummaryResponse();
        summary.setId(userId);
        summary.setMentorBadge(mentorBadge);

        userRepository.findById(userId).ifPresent(user -> {
            summary.setDisplayName(displayNameFor(user));
            summary.setMajor(user.getMajor());
            summary.setYearOfStudy(user.getYearOfStudy());
            summary.setAvatarUrl(user.getAvatarObjectKey());
        });

        if (summary.getDisplayName() == null) {
            summary.setDisplayName(userId.toString());
        }

        return summary;
    }

    public SkillSummaryResponse toSkillSummary(UUID skillId) {
        SkillSummaryResponse summary = new SkillSummaryResponse();
        summary.setId(skillId);

        skillRepository.findById(skillId).ifPresent(skill -> {
            summary.setName(skill.getName());
            summary.setSlug(slugFor(skill));
        });

        return summary;
    }

    private String displayNameFor(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName();
        }

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }

        return user.getEmail();
    }

    private String slugFor(Skill skill) {
        if (skill.getName() == null || skill.getName().isBlank()) {
            return null;
        }

        return skill.getName()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
