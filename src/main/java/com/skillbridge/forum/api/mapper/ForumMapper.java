package com.skillbridge.forum.api.mapper;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.api.dto.response.ForumPostSummaryResponse;
import com.skillbridge.forum.domain.entity.ForumComment;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ForumMapper {

    private final UserRepository userRepository;

    public ForumPostSummaryResponse toSummaryResponse(ForumPost entity) {
        if (entity == null) {
            return null;
        }

        ForumPostSummaryResponse response = new ForumPostSummaryResponse();
        response.setId(entity.getId());
        response.setAuthor(toUserSummary(entity.getAuthorId(), false));

        response.setTitle(entity.getTitle());
        response.setExcerpt(entity.getDescription().substring(0, Math.min(entity.getDescription().length(), 100)));
        response.setSkillTags(Collections.emptyList()); // Stubbed
        response.setAvailability(entity.getAvailabilityText());
        response.setLikeCount(entity.getLikeCount());
        response.setCommentCount(entity.getCommentCount());
        response.setLikedByMe(false); // Derivable from context in real app
        response.setTimestamp(entity.getCreatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }

    public ForumPostResponse toResponse(ForumPost entity) {
        if (entity == null) {
            return null;
        }

        ForumPostResponse response = new ForumPostResponse();
        response.setId(entity.getId());
        response.setAuthor(toUserSummary(entity.getAuthorId(), false));

        response.setTitle(entity.getTitle());
        response.setDescription(entity.getDescription());
        response.setSkillTags(Collections.emptyList()); // Stubbed
        response.setAvailability(entity.getAvailabilityText());
        response.setLikeCount(entity.getLikeCount());
        response.setCommentCount(entity.getCommentCount());
        response.setLikedByMe(false); // Derivable from context
        response.setTimestamp(entity.getCreatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }

    public ForumCommentResponse toResponse(ForumComment entity) {
        if (entity == null) {
            return null;
        }

        ForumCommentResponse response = new ForumCommentResponse();
        response.setId(entity.getId());
        response.setPostId(entity.getPostId());
        response.setAuthor(toUserSummary(entity.getAuthorId(), false));

        response.setBody(entity.getBody());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }

    private UserSummaryResponse toUserSummary(UUID userId, boolean mentorBadge) {
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
}
