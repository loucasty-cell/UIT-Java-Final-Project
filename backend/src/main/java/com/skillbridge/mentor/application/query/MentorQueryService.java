package com.skillbridge.mentor.application.query;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
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
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MentorQueryService {

        private final UserRepository userRepository;
        private final UserSkillRepository userSkillRepository;
        private final MentorOfferingRepository mentorOfferingRepository;
        private final ReviewRepository reviewRepository;
        private final MentorMapper mentorMapper;

        public Page<MentorSummaryResponse> searchMentors(MentorSearchQuery query) {
                // 1. Get all active offerings
                List<MentorOffering> activeOfferings = mentorOfferingRepository.findByActiveTrue();
                Map<UUID, List<MentorOffering>> offeringsByMentor = activeOfferings.stream()
                                .collect(Collectors.groupingBy(MentorOffering::getMentorId, LinkedHashMap::new,
                                                Collectors.toList()));

                List<UUID> mentorIds = new ArrayList<>(offeringsByMentor.keySet());
                if (mentorIds.isEmpty()) {
                        return Page.empty();
                }

                // 2. Batch fetch all users in 1 query
                Map<UUID, User> users = userRepository.findAllByIdIn(mentorIds).stream()
                                .filter(u -> u.getStatus() != AccountStatus.SUSPENDED
                                                && u.getStatus() != AccountStatus.DISABLED)
                                .collect(Collectors.toMap(User::getId, Function.identity()));

                // 3. Batch fetch all skills for all mentors in 2 queries (TEACH + LEARN)
                Map<UUID, List<UserSkill>> teachSkillsByUser = userSkillRepository
                                .findByUserIdInAndDirection(new ArrayList<>(users.keySet()), Direction.TEACH)
                                .stream()
                                .collect(Collectors.groupingBy(UserSkill::getUserId, LinkedHashMap::new,
                                                Collectors.toList()));

                Map<UUID, List<UserSkill>> learnSkillsByUser = userSkillRepository
                                .findByUserIdInAndDirection(new ArrayList<>(users.keySet()), Direction.LEARN)
                                .stream()
                                .collect(Collectors.groupingBy(UserSkill::getUserId, LinkedHashMap::new,
                                                Collectors.toList()));

                // 4. Batch fetch all reviews in 1 query
                Map<UUID, List<Review>> reviewsByUser = reviewRepository
                                .findByRevieweeIdIn(new ArrayList<>(users.keySet()))
                                .stream()
                                .collect(Collectors.groupingBy(Review::getRevieweeId, LinkedHashMap::new,
                                                Collectors.toList()));

                // 5. Build summaries from cached data
                List<MentorSummaryResponse> summaries = new ArrayList<>();

                for (UUID userId : users.keySet()) {
                        User user = users.get(userId);
                        List<MentorOffering> offerings = offeringsByMentor.get(userId);
                        List<UserSkill> userTeachSkills = teachSkillsByUser.getOrDefault(userId, List.of());
                        List<UserSkill> userLearnSkills = learnSkillsByUser.getOrDefault(userId, List.of());
                        List<Review> userReviews = reviewsByUser.getOrDefault(userId, List.of());

                        // Build posted teach skills from offerings
                        Set<UUID> offeredSkillIds = offerings.stream()
                                        .map(MentorOffering::getTeachUserSkillId)
                                        .collect(Collectors.toSet());

                        List<UserSkill> postedTeachSkills = userTeachSkills.stream()
                                        .filter(skill -> offeredSkillIds.contains(skill.getId()))
                                        .collect(Collectors.toMap(UserSkill::getSkillId, skill -> skill,
                                                        (first, ignored) -> first, LinkedHashMap::new))
                                        .values().stream().toList();

                        if (postedTeachSkills.isEmpty()) {
                                continue;
                        }

                        // Build modes set
                        Set<Mode> modes = offerings.stream()
                                        .flatMap(o -> {
                                                Set<Mode> m = o.getModes();
                                                return m != null ? m.stream() : Stream.empty();
                                        })
                                        .collect(Collectors.toCollection(LinkedHashSet::new));

                        if (modes.isEmpty()) {
                                modes.add(Mode.POINTS);
                        }

                        // Calculate min cost
                        int minCost = offerings.stream()
                                        .mapToInt(MentorOffering::getPointCost)
                                        .min().orElse(0);

                        // Build skill DTOs
                        List<SkillSummaryResponse> teachSkillDtos = postedTeachSkills.stream()
                                        .map(ts -> mentorMapper.toSkillSummary(ts.getSkillId()))
                                        .filter(Objects::nonNull)
                                        .collect(Collectors.toList());

                        List<SkillSummaryResponse> learnSkillDtos = userLearnSkills.stream()
                                        .map(ls -> mentorMapper.toSkillSummary(ls.getSkillId()))
                                        .filter(Objects::nonNull)
                                        .collect(Collectors.toList());

                        // Calculate rating
                        double avgRating = userReviews.isEmpty() ? 5.0
                                        : userReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
                        int ratingCount = userReviews.size();

                        if (query != null && query.getEffectiveQuery() != null
                                        && !query.getEffectiveQuery().isBlank()) {
                                String qLower = query.getEffectiveQuery().toLowerCase(Locale.ROOT);
                                boolean matchesUser = Stream.of(user.getDisplayName(), user.getFirstName(),
                                                user.getLastName(), user.getBio(), user.getMajor())
                                                .filter(Objects::nonNull)
                                                .map(value -> value.toLowerCase(Locale.ROOT))
                                                .anyMatch(value -> value.contains(qLower));
                                boolean matchesSkill = teachSkillDtos.stream()
                                                .map(SkillSummaryResponse::getName)
                                                .filter(Objects::nonNull)
                                                .map(value -> value.toLowerCase(Locale.ROOT))
                                                .anyMatch(value -> value.contains(qLower));
                                if (!matchesUser && !matchesSkill) {
                                        continue;
                                }
                        }
                        if (query != null && query.getSkillId() != null
                                        && postedTeachSkills.stream()
                                                        .noneMatch(skill -> skill.getSkillId().equals(query.getSkillId()))) {
                                continue;
                        }
                        if (query != null && query.getLevel() != null
                                        && postedTeachSkills.stream()
                                                        .noneMatch(skill -> skill.getLevel() == query.getLevel())) {
                                continue;
                        }
                        if (query != null && query.getMode() != null && !modes.contains(query.getMode())) {
                                continue;
                        }
                        if (query != null && query.getMinRating() != null && avgRating < query.getMinRating()) {
                                continue;
                        }

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

                List<UserSkill> teachSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId,
                                Direction.TEACH);
                List<UserSkill> learnSkills = userSkillRepository.findByUserIdAndDirectionOrderByCreatedAtDesc(mentorId,
                                Direction.LEARN);

                List<SkillSummaryResponse> teachSkillDtos = teachSkills.stream()
                                .map(ts -> mentorMapper.toSkillSummary(ts.getSkillId()))
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                List<SkillSummaryResponse> learnSkillDtos = learnSkills.stream()
                                .map(ls -> mentorMapper.toSkillSummary(ls.getSkillId()))
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());

                List<Review> reviews = reviewRepository.findByRevieweeId(mentorId);
                double avgRating = reviews.isEmpty() ? 5.0
                                : reviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
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
