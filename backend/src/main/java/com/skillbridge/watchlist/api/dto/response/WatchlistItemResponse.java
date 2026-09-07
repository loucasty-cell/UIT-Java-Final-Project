package com.skillbridge.watchlist.api.dto.response;

import com.skillbridge.watchlist.domain.model.WatchlistItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistItemResponse {

    private UUID id;
    private WatchlistItemType itemType;
    private UUID itemId;
    private String name;
    private String categoryOrBio;
    private String avatarOrIcon;
    private OffsetDateTime createdAt;
}
