package com.skillbridge.mentor.application.query;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.mentor.api.dto.request.MentorSearchQuery;
import com.skillbridge.mentor.api.mapper.MentorMapper;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.api.dto.response.UserSummaryResponse;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MentorQueryServiceTest {

    @Test
    void searchReturnsOnlySkillsWithActiveTeachingPosts() {
        UserRepository userRepository = mock(UserRepository.class);
        UserSkillRepository userSkillRepository = mock(UserSkillRepository.class);
        MentorOfferingRepository offeringRepository = mock(MentorOfferingRepository.class);
        ReviewRepository reviewRepository = mock(ReviewRepository.class);
        MentorMapper mentorMapper = mock(MentorMapper.class);
        MentorQueryService service = new MentorQueryService(userRepository, userSkillRepository,
                offeringRepository, reviewRepository, mentorMapper);

        UUID mentorId = UUID.randomUUID();
        UUID javaUserSkillId = UUID.randomUUID();
        UUID javaSkillId = UUID.randomUUID();
        UUID reactUserSkillId = UUID.randomUUID();
        UUID reactSkillId = UUID.randomUUID();

        User mentor = new User();
        mentor.setId(mentorId);
        mentor.setStatus(AccountStatus.ACTIVE);

        UserSkill postedJava = new UserSkill();
        postedJava.setId(javaUserSkillId);
        postedJava.setUserId(mentorId);
        postedJava.setSkillId(javaSkillId);
        postedJava.setDirection(Direction.TEACH);
        postedJava.setLevel(Level.ADVANCED);

        UserSkill unpostedReact = new UserSkill();
        unpostedReact.setId(reactUserSkillId);
        unpostedReact.setUserId(mentorId);
        unpostedReact.setSkillId(reactSkillId);
        unpostedReact.setDirection(Direction.TEACH);
        unpostedReact.setLevel(Level.ADVANCED);

        MentorOffering javaPost = new MentorOffering();
        javaPost.setMentorId(mentorId);
        javaPost.setTeachUserSkillId(javaUserSkillId);
        javaPost.setPointCost(10);
        javaPost.setPointsEnabled(true);
        javaPost.setSkillSwapEnabled(false);
        javaPost.setVolunteerEnabled(false);

        SkillSummaryResponse javaSummary = new SkillSummaryResponse();
        javaSummary.setId(javaSkillId);
        javaSummary.setName("Java");
        UserSummaryResponse userSummary = new UserSummaryResponse();
        userSummary.setId(mentorId);
        userSummary.setDisplayName("Java Mentor");

        when(offeringRepository.findByActiveTrue()).thenReturn(List.of(javaPost));
        when(userRepository.findById(mentorId)).thenReturn(Optional.of(mentor));
        when(userSkillRepository.findById(javaUserSkillId)).thenReturn(Optional.of(postedJava));
        when(userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId, Direction.TEACH))
                .thenReturn(List.of(postedJava, unpostedReact));
        when(userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId, Direction.LEARN))
                .thenReturn(List.of());
        when(reviewRepository.findByRevieweeId(mentorId)).thenReturn(List.of());
        when(mentorMapper.toSkillSummary(javaSkillId)).thenReturn(javaSummary);
        when(mentorMapper.toUserSummary(mentorId, true)).thenReturn(userSummary);

        Page<com.skillbridge.mentor.api.dto.response.MentorSummaryResponse> result =
                service.searchMentors(new MentorSearchQuery());

        assertEquals(1, result.getTotalElements());
        assertEquals(List.of(javaSummary), result.getContent().getFirst().getMatchingTeachSkills());

        MentorSearchQuery unpostedSkillQuery = new MentorSearchQuery();
        unpostedSkillQuery.setSkillId(reactSkillId);
        assertEquals(0, service.searchMentors(unpostedSkillQuery).getTotalElements());
    }
}
