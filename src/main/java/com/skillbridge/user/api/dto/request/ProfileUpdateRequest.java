package com.skillbridge.user.api.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

// ProfileUpdateRequest: Partial profile update; all fields optional but at least one must be present
// Linkage: ProfileController PATCH /api/v1/me (with If-Match) -> UserProfileService.updateProfile()
@Getter
@Setter
public class ProfileUpdateRequest {

    @Size(max = 100, message = "Display name must not exceed 100 characters")
    private String displayName;

    @Size(max = 100, message = "Major must not exceed 100 characters")
    private String major;

    private Integer yearOfStudy;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;

    @Size(max = 100, message = "Timezone must not exceed 100 characters")
    private String timezone;

    // Storage key of the uploaded avatar; the URL itself is server-derived, never client-owned
    @Size(max = 500, message = "Avatar object key must not exceed 500 characters")
    private String avatarObjectKey;
}
