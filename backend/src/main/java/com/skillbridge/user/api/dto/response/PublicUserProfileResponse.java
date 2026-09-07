package com.skillbridge.user.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicUserProfileResponse {
    private UUID id;
    private String displayName;
    private String firstName;
    private String lastName;
    private String bio;
    private String major;
    private Integer yearOfStudy;
    private String avatarObjectKey;
    private Double averageRating;
    private Long reviewCount;
}
