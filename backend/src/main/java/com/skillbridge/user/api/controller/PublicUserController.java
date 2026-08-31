package com.skillbridge.user.api.controller;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.review.domain.entity.Review;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.api.dto.response.PublicUserProfileResponse;
import com.skillbridge.user.api.dto.response.PublicUserSkillResponse;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/users", "/api/users"})
@RequiredArgsConstructor
@Tag(name = "Public Users", description = "Endpoints for viewing public user profiles and skill listings")
public class PublicUserController {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping("/{userId}/profile")
    @Operation(summary = "Get a user's safe public profile")
    public ResponseEntity<PublicUserProfileResponse> getPublicProfile(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Review> reviews = reviewRepository.findByRevieweeId(userId);
        double avgRating = reviews.isEmpty() ? 0.0 : reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        PublicUserProfileResponse response = PublicUserProfileResponse.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .major(user.getMajor())
                .yearOfStudy(user.getYearOfStudy())
                .avatarObjectKey(user.getAvatarObjectKey())
                .averageRating(avgRating)
                .reviewCount((long) reviews.size())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/skills")
    @Operation(summary = "Get a user's public teach and learn skills")
    public ResponseEntity<List<PublicUserSkillResponse>> getPublicSkills(@PathVariable UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }

        List<UserSkill> skills = userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<PublicUserSkillResponse> responses = skills.stream().map(us -> {
            Skill catalogSkill = skillRepository.findById(us.getSkillId()).orElse(null);
            return PublicUserSkillResponse.builder()
                    .id(us.getId())
                    .skillId(us.getSkillId())
                    .skillName(catalogSkill != null ? catalogSkill.getName() : "Unknown Skill")
                    .category(catalogSkill != null ? catalogSkill.getCategory() : "General")
                    .direction(us.getDirection())
                    .level(us.getLevel())
                    .build();
        }).toList();

        return ResponseEntity.ok(responses);
    }
}
