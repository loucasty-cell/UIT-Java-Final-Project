package com.skillbridge.mentor.application.command;

import com.skillbridge.mentor.api.dto.request.MentorOfferingCreateRequest;
import com.skillbridge.mentor.api.dto.request.MentorOfferingUpdateRequest;
import com.skillbridge.mentor.api.dto.response.MentorOfferingResponse;
import com.skillbridge.mentor.api.mapper.MentorMapper;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class MentorOfferingService {
    private final MentorOfferingRepository offeringRepository;
    private final MentorMapper mentorMapper;
    private final com.skillbridge.auth.infrastructure.persistence.UserRoleRepository userRoleRepository;

    public MentorOfferingResponse createOffering(MentorOfferingCreateRequest request) {
        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();

        MentorOffering entity = new MentorOffering();
        entity.setId(UUID.randomUUID());
        entity.setMentorId(currentUserId);
        entity.setTeachUserSkillId(request.getTeachUserSkillId());
        entity.setPointCost(request.getPointCost());
        entity.setPointsEnabled(request.getPointsEnabled());
        entity.setSkillSwapEnabled(request.getSkillSwapEnabled());
        entity.setVolunteerEnabled(request.getVolunteerEnabled());
        entity.setDurationMinutes(request.getDuration());
        entity.setAvailabilityText(request.getAvailabilityText());
        entity.setActive(true);
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());

        MentorOffering saved = offeringRepository.save(entity);

        if (!userRoleRepository.existsByUserIdAndRole(currentUserId, "MENTOR")) {
            userRoleRepository.save(new com.skillbridge.auth.domain.entity.UserRole(currentUserId, "MENTOR"));
        }

        return mentorMapper.toResponse(saved);
    }

    public MentorOfferingResponse updateOffering(UUID offeringId, MentorOfferingUpdateRequest request) {
        MentorOffering entity = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Offering not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        if (!entity.getMentorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update another mentor's offering");
        }

        if (request.getPointCost() != null) entity.setPointCost(request.getPointCost());
        if (request.getPointsEnabled() != null) entity.setPointsEnabled(request.getPointsEnabled());
        if (request.getSkillSwapEnabled() != null) entity.setSkillSwapEnabled(request.getSkillSwapEnabled());
        if (request.getVolunteerEnabled() != null) entity.setVolunteerEnabled(request.getVolunteerEnabled());
        if (request.getDuration() != null) entity.setDurationMinutes(request.getDuration());
        if (request.getAvailabilityText() != null) entity.setAvailabilityText(request.getAvailabilityText());
        if (request.getActive() != null) entity.setActive(request.getActive());

        entity.setUpdatedAt(OffsetDateTime.now());

        MentorOffering saved = offeringRepository.save(entity);
        return mentorMapper.toResponse(saved);
    }

    public void deleteOffering(UUID offeringId) {
        MentorOffering entity = offeringRepository.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Offering not found"));

        UUID currentUserId = com.skillbridge.shared.security.SecurityUtils.getCurrentUserId();
        if (!entity.getMentorId().equals(currentUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot delete another mentor's offering");
        }

        offeringRepository.delete(entity);
    }
}
