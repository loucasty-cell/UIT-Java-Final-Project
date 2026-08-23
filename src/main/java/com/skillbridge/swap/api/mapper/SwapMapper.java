package com.skillbridge.swap.api.mapper;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.skill.domain.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.api.dto.response.SwapSessionResponse;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SwapMapper {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final SwapSessionRepository sessionRepository;

    public SwapRequestResponse toRequestResponse(SwapRequest entity) {
        if (entity == null) {
            return null;
        }

        SwapRequestResponse response = new SwapRequestResponse();
        response.setId(entity.getId());
        response.setRequester(toUserSummary(entity.getRequesterId()));
        response.setResponder(toUserSummary(entity.getResponderId()));
        response.setOfferedSkill(toSkillSummary(entity.getOfferedSkillId()));
        response.setRequestedSkill(toSkillSummary(entity.getRequestedSkillId()));
        response.setPointCost(entity.getPointCost());
        response.setPointsHeld(entity.getPointsHeld());
        response.setMessage(entity.getMessage());
        response.setStatus(entity.getStatus());
        response.setSessionId(sessionRepository.findBySwapRequestId(entity.getId()).map(SwapSession::getId).orElse(null));
        response.setAcceptedAt(entity.getAcceptedAt());
        response.setRejectedAt(entity.getRejectedAt());
        response.setCompletedAt(entity.getCompletedAt());
        response.setCancelledAt(entity.getCancelledAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());
        return response;
    }

    public SwapSessionResponse toSessionResponse(SwapSession entity) {
        if (entity == null) {
            return null;
        }

        SwapSessionResponse response = new SwapSessionResponse();
        response.setId(entity.getId());
        response.setSwapRequestId(entity.getSwapRequestId());
        response.setRequester(toUserSummary(entity.getRequesterId()));
        response.setResponder(toUserSummary(entity.getResponderId()));
        response.setOfferedSkill(toSkillSummary(entity.getOfferedSkillId()));
        response.setRequestedSkill(toSkillSummary(entity.getRequestedSkillId()));
        response.setPointCost(entity.getPointCost());
        response.setStatus(entity.getStatus());
        response.setAcceptedAt(entity.getAcceptedAt());
        response.setCompletedAt(entity.getCompletedAt());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());
        return response;
    }

    private UserSummaryResponse toUserSummary(UUID userId) {
        UserSummaryResponse summary = new UserSummaryResponse();
        summary.setId(userId);
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

    private SkillSummaryResponse toSkillSummary(UUID skillId) {
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
        return fullName.isBlank() ? user.getEmail() : fullName;
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
