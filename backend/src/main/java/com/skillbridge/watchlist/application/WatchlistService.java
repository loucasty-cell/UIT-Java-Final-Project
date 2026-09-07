package com.skillbridge.watchlist.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.watchlist.api.dto.request.AddWatchlistItemRequest;
import com.skillbridge.watchlist.api.dto.response.WatchlistItemResponse;
import com.skillbridge.watchlist.domain.entity.WatchlistItem;
import com.skillbridge.watchlist.domain.model.WatchlistItemType;
import com.skillbridge.watchlist.infrastructure.persistence.WatchlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistItemRepository watchlistItemRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public WatchlistItemResponse addToWatchlist(AddWatchlistItemRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();

        if (watchlistItemRepository.existsByUserIdAndItemTypeAndItemId(userId, request.getItemType(), request.getItemId())) {
            throw new IllegalStateException("Item is already in your watchlist");
        }

        String name = "";
        String categoryOrBio = "";
        String avatarOrIcon = null;

        if (request.getItemType() == WatchlistItemType.SKILL) {
            Skill skill = skillRepository.findById(request.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + request.getItemId()));
            name = skill.getName();
            categoryOrBio = skill.getCategory();
        } else if (request.getItemType() == WatchlistItemType.MENTOR) {
            User mentor = userRepository.findById(request.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Mentor not found: " + request.getItemId()));
            name = (mentor.getFirstName() + " " + mentor.getLastName()).trim();
            categoryOrBio = mentor.getBio();
            avatarOrIcon = mentor.getAvatarObjectKey();
        }

        WatchlistItem item = new WatchlistItem();
        item.setId(UUID.randomUUID());
        item.setUserId(userId);
        item.setItemType(request.getItemType());
        item.setItemId(request.getItemId());

        WatchlistItem saved = watchlistItemRepository.save(item);

        return WatchlistItemResponse.builder()
                .id(saved.getId())
                .itemType(saved.getItemType())
                .itemId(saved.getItemId())
                .name(name)
                .categoryOrBio(categoryOrBio)
                .avatarOrIcon(avatarOrIcon)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<WatchlistItemResponse> getMyWatchlist() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<WatchlistItem> items = watchlistItemRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<WatchlistItemResponse> responses = new ArrayList<>();

        for (WatchlistItem item : items) {
            String name = "";
            String categoryOrBio = "";
            String avatarOrIcon = null;

            if (item.getItemType() == WatchlistItemType.SKILL) {
                Skill skill = skillRepository.findById(item.getItemId()).orElse(null);
                if (skill != null) {
                    name = skill.getName();
                    categoryOrBio = skill.getCategory();
                }
            } else if (item.getItemType() == WatchlistItemType.MENTOR) {
                User mentor = userRepository.findById(item.getItemId()).orElse(null);
                if (mentor != null) {
                    name = (mentor.getFirstName() + " " + mentor.getLastName()).trim();
                    categoryOrBio = mentor.getBio();
                    avatarOrIcon = mentor.getAvatarObjectKey();
                }
            }

            responses.add(WatchlistItemResponse.builder()
                    .id(item.getId())
                    .itemType(item.getItemType())
                    .itemId(item.getItemId())
                    .name(name)
                    .categoryOrBio(categoryOrBio)
                    .avatarOrIcon(avatarOrIcon)
                    .createdAt(item.getCreatedAt())
                    .build());
        }

        return responses;
    }

    public void removeFromWatchlist(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        watchlistItemRepository.findByIdAndUserId(id, userId)
                .ifPresent(watchlistItemRepository::delete);
    }
}
