package com.skillbridge.watchlist.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.watchlist.api.dto.request.AddWatchlistItemRequest;
import com.skillbridge.watchlist.api.dto.response.WatchlistItemResponse;
import com.skillbridge.watchlist.domain.entity.WatchlistItem;
import com.skillbridge.watchlist.domain.model.WatchlistItemType;
import com.skillbridge.watchlist.infrastructure.persistence.WatchlistItemRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class WatchlistServiceTest {

    private WatchlistItemRepository watchlistItemRepository;
    private SkillRepository skillRepository;
    private UserRepository userRepository;
    private WatchlistService watchlistService;

    private final UUID userId = UUID.randomUUID();
    private final UUID skillId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        watchlistItemRepository = Mockito.mock(WatchlistItemRepository.class);
        skillRepository = Mockito.mock(SkillRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        watchlistService = new WatchlistService(watchlistItemRepository, skillRepository, userRepository);

        TestAuthContext.loginAs(userId);
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void addsSkillToWatchlistSuccessfully() {
        AddWatchlistItemRequest request = new AddWatchlistItemRequest();
        request.setItemType(WatchlistItemType.SKILL);
        request.setItemId(skillId);

        Skill skill = Skill.builder().id(skillId).name("Java").category("Tech").build();

        when(watchlistItemRepository.existsByUserIdAndItemTypeAndItemId(userId, WatchlistItemType.SKILL, skillId))
                .thenReturn(false);
        when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
        when(watchlistItemRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        WatchlistItemResponse response = watchlistService.addToWatchlist(request);

        assertNotNull(response);
        assertEquals("Java", response.getName());
        assertEquals("Tech", response.getCategoryOrBio());
    }

    @Test
    void preventsDuplicateWatchlistEntries() {
        AddWatchlistItemRequest request = new AddWatchlistItemRequest();
        request.setItemType(WatchlistItemType.SKILL);
        request.setItemId(skillId);

        when(watchlistItemRepository.existsByUserIdAndItemTypeAndItemId(userId, WatchlistItemType.SKILL, skillId))
                .thenReturn(true);

        assertThrows(IllegalStateException.class, () -> watchlistService.addToWatchlist(request));
    }

    @Test
    void removesItemFromWatchlist() {
        UUID itemId = UUID.randomUUID();
        WatchlistItem item = new WatchlistItem();
        item.setId(itemId);
        item.setUserId(userId);

        when(watchlistItemRepository.findByIdAndUserId(itemId, userId)).thenReturn(Optional.of(item));

        watchlistService.removeFromWatchlist(itemId);

        verify(watchlistItemRepository).delete(item);
    }
}
