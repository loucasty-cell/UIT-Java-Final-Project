package com.skillbridge.watchlist.api.controller;

import com.skillbridge.watchlist.api.dto.request.AddWatchlistItemRequest;
import com.skillbridge.watchlist.api.dto.response.WatchlistItemResponse;
import com.skillbridge.watchlist.application.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/me/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist & Bookmarks", description = "Endpoints for bookmarking and managing saved skills and mentors")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    @Operation(summary = "Get current user's saved watchlist items")
    public ResponseEntity<List<WatchlistItemResponse>> getMyWatchlist() {
        return ResponseEntity.ok(watchlistService.getMyWatchlist());
    }

    @PostMapping
    @Operation(summary = "Add a skill or mentor to personal watchlist")
    public ResponseEntity<WatchlistItemResponse> addToWatchlist(@Valid @RequestBody AddWatchlistItemRequest request) {
        WatchlistItemResponse response = watchlistService.addToWatchlist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove an item from personal watchlist")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable("id") UUID id) {
        watchlistService.removeFromWatchlist(id);
        return ResponseEntity.noContent().build();
    }
}
