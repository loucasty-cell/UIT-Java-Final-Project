package com.skillbridge.user.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

// MyProfileResponse: Safe owner-facing profile projection
// Linkage: Built by UserMapper from the User entity + roles; never exposes passwordHash or token hashes
@Getter
@Builder
@AllArgsConstructor
public class MyProfileResponse {

    private final UUID id;

    private final String email;

    private final String firstName;

    private final String lastName;

    // Optional display name overriding first/last in UI surfaces when present
    private final String displayName;

    private final String major;

    private final Integer yearOfStudy;

    private final String bio;

    private final String timezone;

    // Server-derived avatar URL from the stored object key; null until an avatar exists
    private final String avatarUrl;

    private final List<String> roles;

    private final String accountStatus;

    // Aggregates owned by future review/session slices; zero until those features land
    private final Double ratingAverage;

    private final Long ratingCount;

    private final Long completedSessionCount;

    private final OffsetDateTime createdAt;

    private final OffsetDateTime updatedAt;

    // Optimistic-lock version surfaced for If-Match on PATCH /me
    private final Long version;
}
