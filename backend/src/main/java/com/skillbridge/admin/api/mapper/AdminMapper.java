package com.skillbridge.admin.api.mapper;

import com.skillbridge.admin.api.dto.response.*;
import com.skillbridge.admin.domain.entity.*;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@lombok.RequiredArgsConstructor
public class AdminMapper {
    private final com.skillbridge.auth.infrastructure.persistence.UserRepository userRepository;

    public UserSummaryResponse toUserSummary(UUID userId) {
        if (userId == null) {
            return null;
        }
        UserSummaryResponse summary = new UserSummaryResponse();
        summary.setId(userId);
        summary.setDisplayName(userId.toString());
        userRepository.findById(userId).ifPresent(user -> {
            summary.setDisplayName(user.getDisplayName() != null && !user.getDisplayName().isBlank()
                    ? user.getDisplayName() : (user.getFirstName() + " " + user.getLastName()).trim());
        });
        return summary;
    }

    public ReportResponse toResponse(Report entity) {
        if (entity == null) {
            return null;
        }

        return ReportResponse.builder()
                .id(entity.getId())
                .reporter(toUserSummary(entity.getReporterId()))
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .reason(entity.getReason())
                .details(entity.getDetails())
                .excerpt(entity.getDetails() != null && entity.getDetails().length() > 100
                        ? entity.getDetails().substring(0, 100) + "..."
                        : entity.getDetails())
                .status(entity.getStatus())
                .actionTaken(entity.getActionTaken())
                .resolvedBy(toUserSummary(entity.getResolvedBy()))
                .resolvedAt(entity.getResolvedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .version(entity.getVersion())
                .build();
    }

    public AccountWarningResponse toResponse(AccountWarning entity) {
        if (entity == null) {
            return null;
        }

        return AccountWarningResponse.builder()
                .id(entity.getId())
                .user(toUserSummary(entity.getUserId()))
                .admin(toUserSummary(entity.getAdminId()))
                .reason(entity.getReason())
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public DisputeResponse toResponse(Dispute entity) {
        if (entity == null) {
            return null;
        }

        return DisputeResponse.builder()
                .id(entity.getId())
                .sessionId(entity.getSessionId())
                .sessionMode(entity.getSessionMode())
                .openedBy(toUserSummary(entity.getOpenedBy()))
                .reason(entity.getReason())
                .details(entity.getDetails())
                .status(entity.getStatus())
                .resolution(entity.getResolution())
                .resolutionNote(entity.getResolutionNote())
                .resolvedBy(toUserSummary(entity.getResolvedBy()))
                .resolvedAt(entity.getResolvedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .version(entity.getVersion())
                .build();
    }

    public PlatformSettingsResponse toResponse(PlatformSetting entity) {
        if (entity == null) {
            return null;
        }

        return PlatformSettingsResponse.builder()
                .id(entity.getId())
                .registrationBonus(entity.getRegistrationBonus())
                .forumContributionReward(entity.getForumContributionReward())
                .escrowReleaseHours(entity.getEscrowReleaseHours())
                .updatedBy(toUserSummary(entity.getUpdatedBy()))
                .updatedAt(entity.getUpdatedAt())
                .version(entity.getVersion())
                .build();
    }

    public AdminAuditEventResponse toResponse(AdminAuditEvent entity) {
        if (entity == null) {
            return null;
        }

        return AdminAuditEventResponse.builder()
                .id(entity.getId())
                .actor(toUserSummary(entity.getActorId()))
                .action(entity.getAction())
                .targetType(entity.getTargetType())
                .targetId(entity.getTargetId())
                .beforeSummary(entity.getBeforeSummary())
                .afterSummary(entity.getAfterSummary())
                .reason(entity.getReason())
                .requestId(entity.getRequestId())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
