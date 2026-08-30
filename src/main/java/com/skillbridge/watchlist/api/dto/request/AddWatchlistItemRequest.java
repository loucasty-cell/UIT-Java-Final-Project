package com.skillbridge.watchlist.api.dto.request;

import com.skillbridge.watchlist.domain.model.WatchlistItemType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddWatchlistItemRequest {

    @NotNull(message = "Item type (SKILL or MENTOR) is required")
    private WatchlistItemType itemType;

    @NotNull(message = "Item ID is required")
    private UUID itemId;
}
