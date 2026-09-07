package com.skillbridge.watchlist.infrastructure.persistence;

import com.skillbridge.watchlist.domain.entity.WatchlistItem;
import com.skillbridge.watchlist.domain.model.WatchlistItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, UUID> {
    List<WatchlistItem> findByUserIdOrderByCreatedAtDesc(UUID userId);
    boolean existsByUserIdAndItemTypeAndItemId(UUID userId, WatchlistItemType itemType, UUID itemId);
    Optional<WatchlistItem> findByIdAndUserId(UUID id, UUID userId);
    void deleteByIdAndUserId(UUID id, UUID userId);
}
