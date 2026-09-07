package com.skillbridge.learningneed.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.learningneed.api.dto.request.LearningNeedCreateRequest;
import com.skillbridge.learningneed.api.dto.request.TeachingOfferCreateRequest;
import com.skillbridge.learningneed.api.dto.response.LearningNeedResponse;
import com.skillbridge.learningneed.domain.entity.LearningNeed;
import com.skillbridge.learningneed.domain.entity.LearningNeedOffer;
import com.skillbridge.learningneed.infrastructure.persistence.LearningNeedOfferRepository;
import com.skillbridge.learningneed.infrastructure.persistence.LearningNeedRepository;
import com.skillbridge.learningrequest.application.command.LearningRequestService;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.SessionMode;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Arrays;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class LearningNeedService {
    private final LearningNeedRepository learningNeedRepository;
    private final LearningNeedOfferRepository offerRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final MentorOfferingRepository mentorOfferingRepository;
    private final LearningRequestService learningRequestService;

    @Transactional(readOnly = true)
    public List<LearningNeedResponse> listActive() {
        UUID viewerId = SecurityUtils.getCurrentUserId();
        return learningNeedRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(need -> toResponse(need, viewerId))
                .toList();
    }

    public LearningNeedResponse create(LearningNeedCreateRequest request) {
        UUID learnerId = SecurityUtils.getCurrentUserId();
        if (!skillRepository.existsById(request.getSkillId())) {
            throw new IllegalArgumentException("Skill not found");
        }
        if (mentorOfferingRepository.findByActiveTrue().stream().anyMatch(offering ->
                userSkillRepository.findById(offering.getTeachUserSkillId())
                        .map(skill -> skill.getSkillId().equals(request.getSkillId()))
                        .orElse(false))) {
            throw new IllegalArgumentException("An active teaching post already exists for this skill. Find it under Find Mentors instead.");
        }
        OffsetDateTime now = OffsetDateTime.now();
        List<SessionMode> allowedModes = request.getAllowedModes().stream().distinct().toList();
        if (allowedModes.contains(SessionMode.SKILL_SWAP)) {
            if (request.getExchangeUserSkillId() == null) {
                throw new IllegalArgumentException("Choose one of your teaching skills for skill exchange");
            }
            var exchangeSkill = userSkillRepository.findByIdAndUserId(request.getExchangeUserSkillId(), learnerId)
                    .orElseThrow(() -> new IllegalArgumentException("Exchange skill does not belong to you"));
            if (exchangeSkill.getDirection() != Direction.TEACH) {
                throw new IllegalArgumentException("Exchange skill must be in your teaching portfolio");
            }
        }
        LearningNeed need = new LearningNeed();
        need.setId(UUID.randomUUID());
        need.setLearnerId(learnerId);
        need.setSkillId(request.getSkillId());
        need.setTitle(request.getTitle().trim());
        need.setDescription(request.getDescription().trim());
        need.setAvailabilityText(request.getAvailabilityText() == null ? null : request.getAvailabilityText().trim());
        need.setDurationMinutes(request.getDurationMinutes());
        need.setAllowedModes(allowedModes.stream().map(Enum::name).collect(java.util.stream.Collectors.joining(",")));
        need.setExchangeUserSkillId(allowedModes.contains(SessionMode.SKILL_SWAP) ? request.getExchangeUserSkillId() : null);
        need.setActive(true);
        need.setCreatedAt(now);
        need.setUpdatedAt(now);
        return toResponse(learningNeedRepository.save(need), learnerId);
    }

    public void delete(UUID needId) {
        LearningNeed need = findActive(needId);
        if (!need.getLearnerId().equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("Only the learner can remove this notice");
        }
        need.setActive(false);
        need.setUpdatedAt(OffsetDateTime.now());
        learningNeedRepository.save(need);
    }

    public LearningNeedResponse offerToTeach(UUID needId, TeachingOfferCreateRequest request) {
        UUID teacherId = SecurityUtils.getCurrentUserId();
        LearningNeed need = findActive(needId);
        if (need.getLearnerId().equals(teacherId)) {
            throw new IllegalArgumentException("You cannot offer to teach your own learning need");
        }
        if (!userSkillRepository.existsByUserIdAndSkillIdAndDirection(teacherId, need.getSkillId(), Direction.TEACH)) {
            throw new IllegalArgumentException("Add this skill to your teaching portfolio before offering to teach it");
        }
        if (offerRepository.existsByLearningNeedIdAndTeacherId(needId, teacherId)) {
            throw new IllegalStateException("You have already offered to teach this learner");
        }
        List<SessionMode> allowedModes = allowedModes(need);
        if (!allowedModes.contains(request.getMode())) {
            throw new IllegalArgumentException("Choose one of the session modes selected by the learner");
        }
        LearningNeedOffer offer = new LearningNeedOffer();
        offer.setId(UUID.randomUUID());
        offer.setLearningNeedId(needId);
        offer.setTeacherId(teacherId);
        offer.setMessage(request.getMessage() == null ? null : request.getMessage().trim());
        offer.setProposedStart(request.getProposedStart());
        offer.setCreatedAt(OffsetDateTime.now());
        offerRepository.save(offer);

        learningRequestService.createLearningNeedOfferRequest(
                need.getLearnerId(),
                teacherId,
                need.getSkillId(),
                request.getProposedStart(),
                need.getDurationMinutes(),
                offer.getMessage(),
                offer.getId(),
                request.getMode(),
                request.getMode() == SessionMode.SKILL_SWAP ? need.getExchangeUserSkillId() : null);
        return toResponse(need, teacherId);
    }

    private LearningNeed findActive(UUID needId) {
        LearningNeed need = learningNeedRepository.findById(needId)
                .orElseThrow(() -> new IllegalArgumentException("Learning need not found"));
        if (!Boolean.TRUE.equals(need.getActive())) {
            throw new IllegalStateException("This learning need is no longer active");
        }
        return need;
    }

    private LearningNeedResponse toResponse(LearningNeed need, UUID viewerId) {
        LearningNeedResponse response = new LearningNeedResponse();
        response.setId(need.getId());
        response.setLearnerId(need.getLearnerId());
        response.setLearnerName(userRepository.findById(need.getLearnerId()).map(this::displayName).orElse("SkillBridge learner"));
        response.setSkillId(need.getSkillId());
        response.setSkillName(skillName(need.getSkillId()));
        response.setTitle(need.getTitle());
        response.setDescription(need.getDescription());
        response.setAvailabilityText(need.getAvailabilityText());
        response.setDurationMinutes(need.getDurationMinutes());
        response.setAllowedModes(allowedModes(need));
        if (need.getExchangeUserSkillId() != null) {
            response.setExchangeSkillName(userSkillRepository.findById(need.getExchangeUserSkillId())
                    .map(skill -> skillName(skill.getSkillId()))
                    .orElse(null));
        }
        response.setOfferCount(offerRepository.countByLearningNeedId(need.getId()));
        response.setOfferedByMe(offerRepository.existsByLearningNeedIdAndTeacherId(need.getId(), viewerId));
        response.setCreatedAt(need.getCreatedAt());
        return response;
    }

    private String skillName(UUID skillId) {
        return skillRepository.findById(skillId).map(Skill::getName).orElse("Skill");
    }

    private List<SessionMode> allowedModes(LearningNeed need) {
        if (need.getAllowedModes() == null || need.getAllowedModes().isBlank()) {
            return List.of(SessionMode.VOLUNTEER);
        }
        return Arrays.stream(need.getAllowedModes().split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(SessionMode::valueOf)
                .distinct()
                .toList();
    }

    private String displayName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) return user.getDisplayName();
        String fullName = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                + (user.getLastName() == null ? "" : user.getLastName())).trim();
        return fullName.isBlank() ? user.getEmail() : fullName;
    }
}
