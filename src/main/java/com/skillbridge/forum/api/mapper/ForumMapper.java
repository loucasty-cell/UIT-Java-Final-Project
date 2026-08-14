package com.skillbridge.forum.api.mapper;

import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.api.dto.response.ForumPostSummaryResponse;
import com.skillbridge.forum.domain.entity.ForumComment;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class ForumMapper {

    public ForumPostSummaryResponse toSummaryResponse(ForumPost entity) {
        if (entity == null) {
            return null;
        }

        ForumPostSummaryResponse response = new ForumPostSummaryResponse();
        response.setId(entity.getId());

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(entity.getAuthorId());
        // TODO: Populate displayName and other fields once User domain is available
        // TODO: Populate displayName and other fields once User domain is available
        response.setAuthor(author);

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

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(entity.getAuthorId());
        author.setDisplayName("Forum Author");
        response.setAuthor(author);

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

        UserSummaryResponse author = new UserSummaryResponse();
        author.setId(entity.getAuthorId());
        // TODO: Populate displayName and other fields once User domain is available
        response.setAuthor(author);

        response.setBody(entity.getBody());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setVersion(entity.getVersion());

        return response;
    }
}
