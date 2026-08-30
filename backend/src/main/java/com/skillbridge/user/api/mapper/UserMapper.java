package com.skillbridge.user.api.mapper;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.user.api.dto.response.DashboardResponse;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import org.springframework.stereotype.Component;

import java.util.List;

// UserMapper: The only class that knows both the auth User entity shape and user-feature DTO shapes
// Linkage: Used by UserProfileQueryService, DashboardQueryService, and UserProfileService responses
@Component
public class UserMapper {

    // Projects the persisted account into the safe owner-facing profile; aggregates not yet
    // implemented (reviews, sessions) are reported as zero per contract placeholders
    public MyProfileResponse toMyProfileResponse(User user, List<String> roles) {
        return MyProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .major(user.getMajor())
                .yearOfStudy(user.getYearOfStudy())
                .bio(user.getBio())
                .timezone(user.getTimezone())
                .avatarUrl(buildAvatarUrl(user.getAvatarObjectKey()))
                .roles(roles)
                .accountStatus(user.getStatus().name())
                .ratingAverage(0.0)
                .ratingCount(0L)
                .completedSessionCount(0L)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .version(user.getVersion())
                .build();
    }

    // Derives a stable avatar URL from the stored storage object key; null until an avatar exists
    private String buildAvatarUrl(String avatarObjectKey) {
        if (avatarObjectKey == null || avatarObjectKey.isBlank()) {
            return null;
        }
        return "/api/v1/files/" + avatarObjectKey;
    }

    // Assembles the dashboard projection; session/skill/certificate groups stay empty until
    // their feature slices land, while wallet and recent activity are sourced live
    public DashboardResponse toDashboardResponse(
            MyProfileResponse profile,
            com.skillbridge.wallet.api.dto.response.WalletResponse wallet,
            List<PointTransactionResponse> recentActivity
    ) {
        return DashboardResponse.builder()
                .profile(profile)
                .wallet(wallet)
                .completedSessionCount(profile.getCompletedSessionCount())
                .mentorSessionCount(0L)
                .learnerSessionCount(0L)
                .nextSessions(List.of())
                .teachSkills(List.of())
                .learnSkills(List.of())
                .certificates(List.of())
                .recentActivity(recentActivity)
                .build();
    }
}
