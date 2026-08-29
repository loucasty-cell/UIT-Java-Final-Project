package com.skillbridge.auth.domain.entity;

import com.skillbridge.admin.domain.model.AccountStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    // Optional profile fields managed by the user feature (PATCH /api/v1/me); nullable until set
    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "major", length = 100)
    private String major;

    @Column(name = "year_of_study")
    private Integer yearOfStudy;

    @Column(name = "bio", length = 1000)
    private String bio;

    @Column(name = "timezone", length = 100)
    private String timezone;

    @Column(name = "avatar_object_key", length = 500)
    private String avatarObjectKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private AccountStatus status;

    @Column(name = "referral_code", length = 12, unique = true)
    private String referralCode;

    @Column(name = "referred_by")
    private UUID referredBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
