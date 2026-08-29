package com.skillbridge.mentor.application.query;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.domain.model.Role;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.mentor.api.dto.request.MentorSearchQuery;
import com.skillbridge.mentor.api.dto.response.MentorDetailResponse;
import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.api.dto.response.MentorSummaryResponse;
import com.skillbridge.mentor.api.mapper.MentorMapper;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Mode;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MentorQueryService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserSkillRepository userSkillRepository;
    private final MentorOfferingRepository mentorOfferingRepository;
    private final ReviewRepository reviewRepository;
    private final SkillRepository skillRepository;
    private final MentorMapper mentorMapper;

    public Page<MentorSummaryResponse> searchMentors(MentorSearchQuery query) {
        Set<UUID> mentorUserIds = new LinkedHashSet<>();

        List<UserRole> mentorRoles = userRoleRepository.findByRole(Role.MENTOR.name());
        for (UserRole ur : mentorRoles) {
            mentorUserIds.add(ur.getUserId());
        }

        List<MentorOffering> activeOfferings = mentorOfferingRepository.findByActiveTrue();
        for (MentorOffering mo : activeOfferings) {
            mentorUserIds.add(mo.getMentorId());
        }

        if (mentorUserIds.isEmpty()) {
            List<User> allUsers = userRepository.findAll();
            for (User u : allUsers) {
                mentorUserIds.add(u.getId());
            }
        }

        List<MentorSummaryResponse> summaries = new ArrayList<>();

        for (UUID userId : mentorUserIds) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || user.getStatus() != AccountStatus.ACTIVE) {
                continue;
            }

            List<UserSkill> teachSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(userId, Direction.TEACH);
            List<UserSkill> learnSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(userId, Direction.LEARN);
            List<MentorOffering> offerings = mentorOfferingRepository.findByMentorIdAndActiveTrue(userId);

            if (query != null && query.getQ() != null && !query.getQ().isBlank()) {
                String qLower = query.getQ().toLowerCase(Locale.ROOT);
                boolean matchesUser = (user.getDisplayName() != null && user.getDisplayName().toLowerCase(Locale.ROOT).contains(qLower))
                        || (user.getFirstName() != null && user.getFirstName().toLowerCase(Locale.ROOT).contains(qLower))
                        || (user.getLastName() != null && user.getLastName().toLowerCase(Locale.ROOT).contains(qLower))
                        || (user.getBio() != null && user.getBio().toLowerCase(Locale.ROOT).contains(qLower))
                        || (user.getMajor() != null && user.getMajor().toLowerCase(Locale.ROOT).contains(qLower));

                boolean matchesSkill = teachSkills.stream().anyMatch(ts -> {
                    Skill s = skillRepository.findById(ts.getSkillId()).orElse(null);
                    return s != null && s.getName() != null && s.getName().toLowerCase(Locale.ROOT).contains(qLower);
                });

                if (!matchesUser && !matchesSkill) {
                    continue;
                }
            }

            if (query != null && query.getSkillId() != null) {
                boolean hasSkill = teachSkills.stream().anyMatch(ts -> ts.getSkillId().equals(query.getSkillId()))
                        || offerings.stream().anyMatch(o -> o.getTeachUserSkillId().equals(query.getSkillId()));
                if (!hasSkill) {
                    continue;
                }
            }

            if (query != null && query.getLevel() != null) {
                boolean matchesLevel = teachSkills.stream().anyMatch(ts -> ts.getLevel() == query.getLevel());
                if (!matchesLevel) {
                    continue;
                }
            }

            Set<Mode> modes = new LinkedHashSet<>();
            for (MentorOffering off : offerings) {
                if (Boolean.TRUE.equals(off.getPointsEnabled())) modes.add(Mode.POINTS);
                if (Boolean.TRUE.equals(off.getSkillSwapEnabled())) modes.add(Mode.SKILL_SWAP);
                if (Boolean.TRUE.equals(off.getVolunteerEnabled())) modes.add(Mode.VOLUNTEER);
            }
            if (modes.isEmpty()) {
                modes.add(Mode.SKILL_SWAP);
            }

            if (query != null && query.getMode() != null && !modes.contains(query.getMode())) {
                continue;
            }

            List<Review> reviews = reviewRepository.findByRevieweeId(userId);
            double avgRating = reviews.isEmpty() ? 5.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
            int ratingCount = reviews.size();

            int minCost = offerings.stream()
                    .map(MentorOffering::getPointCost)
                    .filter(Objects::nonNull)
                    .min(Integer::compareTo)
                    .orElse(0);

            List<SkillSummaryResponse> teachSkillDtos = teachSkills.stream()
                    .map(ts -> mentorMapper.toSkillSummary(ts.getSkillId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            List<SkillSummaryResponse> learnSkillDtos = learnSkills.stream()
                    .map(ls -> mentorMapper.toSkillSummary(ls.getSkillId()))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            MentorSummaryResponse response = new MentorSummaryResponse();
            response.setUser(mentorMapper.toUserSummary(userId, true));
            response.setRating(Math.round(avgRating * 10.0) / 10.0);
            response.setRatingCount(ratingCount);
            response.setActiveModes(new ArrayList<>(modes));
            response.setMatchingTeachSkills(teachSkillDtos);
            response.setWantedSkills(learnSkillDtos);
            response.setMinimumPointCost(minCost);

            summaries.add(response);
        }

        int pageNum = (query != null && query.getPage() != null && query.getPage() >= 0) ? query.getPage() : 0;
        int pageSize = (query != null && query.getSize() != null && query.getSize() > 0) ? query.getSize() : 20;

        int start = Math.min(pageNum * pageSize, summaries.size());
        int end = Math.min(start + pageSize, summaries.size());
        List<MentorSummaryResponse> pageContent = summaries.subList(start, end);

        return new PageImpl<>(pageContent, PageRequest.of(pageNum, pageSize), summaries.size());
    }

    public MentorDetailResponse getMentorDetail(UUID mentorId) {
        if (mentorId == null) {
            throw new IllegalArgumentException("Mentor ID must not be null");
        }

        User user = userRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found: " + mentorId));

        List<MentorOffering> offerings = mentorOfferingRepository.findByMentorIdAndActiveTrue(mentorId);
        List<MentorOfferingResponse> offeringDtos = offerings.stream()
                .map(mentorMapper::toResponse)
                .collect(Collectors.toList());

        List<UserSkill> teachSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId, Direction.TEACH);
        List<UserSkill> learnSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId, Direction.LEARN);

        List<SkillSummaryResponse> teachSkillDtos = teachSkills.stream()
                .map(ts -> mentorMapper.toSkillSummary(ts.getSkillId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<SkillSummaryResponse> learnSkillDtos = learnSkills.stream()
                .map(ls -> mentorMapper.toSkillSummary(ls.getSkillId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Review> reviews = reviewRepository.findByRevieweeId(mentorId);
        double avgRating = reviews.isEmpty() ? 5.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        int ratingCount = reviews.size();

        MentorDetailResponse response = new MentorDetailResponse();
        response.setUser(mentorMapper.toUserSummary(mentorId, true));
        response.setActiveOfferings(offeringDtos);
        response.setAllVisibleTeachSkills(teachSkillDtos);
        response.setAllVisibleLearnSkills(learnSkillDtos);
        response.setRating(Math.round(avgRating * 10.0) / 10.0);
        response.setRatingCount(ratingCount);

        return response;
    }
}
