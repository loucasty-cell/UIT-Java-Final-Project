package com.skillbridge.mentorapplication.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.domain.entity.UserRoleId;
import com.skillbridge.auth.domain.model.Role;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.mentorapplication.api.dto.request.RejectMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.request.SubmitMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.response.MentorApplicationResponse;
import com.skillbridge.mentorapplication.domain.entity.MentorApplication;
import com.skillbridge.mentorapplication.domain.entity.MentorApplicationSkill;
import com.skillbridge.mentorapplication.domain.model.MentorApplicationStatus;
import com.skillbridge.mentorapplication.infrastructure.persistence.MentorApplicationRepository;
import com.skillbridge.mentorapplication.infrastructure.persistence.MentorApplicationSkillRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MentorApplicationService {

    private final MentorApplicationRepository applicationRepository;
    private final MentorApplicationSkillRepository applicationSkillRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final SkillRepository skillRepository;
    private final NotificationService notificationService;

    public MentorApplicationResponse submitApplication(SubmitMentorApplicationRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        if (applicationRepository.existsByUserIdAndStatus(userId, MentorApplicationStatus.PENDING)) {
            throw new IllegalStateException("You already have a pending mentor application under review");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        MentorApplication application = new MentorApplication();
        application.setId(UUID.randomUUID());
        application.setUserId(userId);
        application.setStatus(MentorApplicationStatus.PENDING);
        application.setExperience(request.getExperience());
        application.setMotivation(request.getMotivation());

        MentorApplication saved = applicationRepository.save(application);

        List<SkillSummaryResponse> skillSummaries = new ArrayList<>();
        if (request.getTeachSkillIds() != null) {
            for (UUID skillId : request.getTeachSkillIds()) {
                Skill skill = skillRepository.findById(skillId).orElse(null);
                if (skill != null) {
                    MentorApplicationSkill appSkill = new MentorApplicationSkill(saved.getId(), skillId);
                    applicationSkillRepository.save(appSkill);
                    skillSummaries.add(SkillSummaryResponse.builder()
                            .id(skill.getId())
                            .name(skill.getName())
                            .category(skill.getCategory())
                            .build());
                }
            }
        }

        notificationService.notifyUser(
                userId,
                "Mentor Application Submitted",
                "Your mentor application has been submitted and is currently under review by the moderation team.",
                "MENTOR_APPLICATION",
                saved.getId()
        );

        return toResponse(saved, user, skillSummaries);
    }

    @Transactional(readOnly = true)
    public MentorApplicationResponse getMyApplication() {
        UUID userId = SecurityUtils.getCurrentUserId();
        MentorApplication application = applicationRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElse(null);

        if (application == null) {
            return null;
        }

        User user = userRepository.findById(userId).orElse(null);
        List<SkillSummaryResponse> skills = getApplicationSkills(application.getId());
        return toResponse(application, user, skills);
    }

    @Transactional(readOnly = true)
    public List<MentorApplicationResponse> getPendingApplications() {
        List<MentorApplication> pendingList = applicationRepository.findByStatusOrderByCreatedAtDesc(MentorApplicationStatus.PENDING);
        return pendingList.stream().map(app -> {
            User user = userRepository.findById(app.getUserId()).orElse(null);
            List<SkillSummaryResponse> skills = getApplicationSkills(app.getId());
            return toResponse(app, user, skills);
        }).toList();
    }

    public MentorApplicationResponse approveApplication(UUID applicationId) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        MentorApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor application not found: " + applicationId));

        if (application.getStatus() != MentorApplicationStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be approved");
        }

        application.setStatus(MentorApplicationStatus.APPROVED);
        application.setReviewedBy(adminId);
        application.setReviewedAt(OffsetDateTime.now());
        MentorApplication saved = applicationRepository.save(application);

        // Grant MENTOR role to user
        UserRoleId roleId = new UserRoleId(application.getUserId(), Role.MENTOR.name());
        if (!userRoleRepository.existsById(roleId)) {
            UserRole userRole = new UserRole(application.getUserId(), Role.MENTOR.name());
            userRoleRepository.save(userRole);
        }

        notificationService.notifyUser(
                application.getUserId(),
                "Mentor Application Approved",
                "🎉 Congratulations! Your mentor application has been approved. You are now an official SkillBridge Mentor.",
                "MENTOR_APPLICATION",
                saved.getId()
        );

        User user = userRepository.findById(application.getUserId()).orElse(null);
        List<SkillSummaryResponse> skills = getApplicationSkills(saved.getId());
        return toResponse(saved, user, skills);
    }

    public MentorApplicationResponse rejectApplication(UUID applicationId, RejectMentorApplicationRequest request) {
        UUID adminId = SecurityUtils.getCurrentUserId();
        MentorApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor application not found: " + applicationId));

        if (application.getStatus() != MentorApplicationStatus.PENDING) {
            throw new IllegalStateException("Only pending applications can be rejected");
        }

        application.setStatus(MentorApplicationStatus.REJECTED);
        application.setAdminNotes(request != null ? request.getAdminNotes() : null);
        application.setReviewedBy(adminId);
        application.setReviewedAt(OffsetDateTime.now());
        MentorApplication saved = applicationRepository.save(application);

        String notes = (request != null && request.getAdminNotes() != null) ? ": " + request.getAdminNotes() : ".";
        notificationService.notifyUser(
                application.getUserId(),
                "Mentor Application Declined",
                "Your mentor application was declined" + notes + " You may update your credentials and re-apply.",
                "MENTOR_APPLICATION",
                saved.getId()
        );

        User user = userRepository.findById(application.getUserId()).orElse(null);
        List<SkillSummaryResponse> skills = getApplicationSkills(saved.getId());
        return toResponse(saved, user, skills);
    }

    private List<SkillSummaryResponse> getApplicationSkills(UUID applicationId) {
        List<MentorApplicationSkill> appSkills = applicationSkillRepository.findByApplicationId(applicationId);
        List<SkillSummaryResponse> skillList = new ArrayList<>();
        for (MentorApplicationSkill as : appSkills) {
            skillRepository.findById(as.getSkillId()).ifPresent(skill ->
                    skillList.add(SkillSummaryResponse.builder()
                            .id(skill.getId())
                            .name(skill.getName())
                            .category(skill.getCategory())
                            .build())
            );
        }
        return skillList;
    }

    private MentorApplicationResponse toResponse(MentorApplication entity, User user, List<SkillSummaryResponse> skills) {
        String userName = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : null;
        String userEmail = user != null ? user.getEmail() : null;

        return MentorApplicationResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .userName(userName)
                .userEmail(userEmail)
                .status(entity.getStatus())
                .experience(entity.getExperience())
                .motivation(entity.getMotivation())
                .adminNotes(entity.getAdminNotes())
                .skills(skills)
                .reviewedBy(entity.getReviewedBy())
                .reviewedAt(entity.getReviewedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
