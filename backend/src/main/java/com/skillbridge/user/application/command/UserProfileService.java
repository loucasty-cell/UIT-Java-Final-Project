package com.skillbridge.user.application.command;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.user.api.dto.request.ChangePasswordRequest;
import com.skillbridge.user.api.dto.request.NotificationPreferencesUpdateRequest;
import com.skillbridge.user.api.dto.response.NotificationPreferencesResponse;
import com.skillbridge.user.api.dto.request.ProfileUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

// UserProfileService: Transactional use case for partial profile updates with optimistic locking
// Linkage: ProfileController PATCH /api/v1/me -> UserProfileService -> UserRepository (users table)
@Service
@Transactional
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    // Applies the non-null request fields onto the caller's account after an If-Match version check
    // Linkage: Invoked by ProfileController.updateMyProfile(); version comes from the If-Match header
    public User updateProfile(UUID ownerId, ProfileUpdateRequest request, Long expectedVersion) {
        // Step 1: Load the caller's own account; ownership is derived from the JWT subject only
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + ownerId));

        // Step 2: Enforce optimistic concurrency; a stale If-Match means someone else updated first
        requireMatchingVersion(user, expectedVersion);

        // Step 3: Reject fully empty payloads so PATCH always carries at least one change
        boolean hasAtLeastOneField = request.getFirstName() != null
                || request.getLastName() != null
                || request.getDisplayName() != null
                || request.getMajor() != null
                || request.getYearOfStudy() != null
                || request.getBio() != null
                || request.getTimezone() != null
                || request.getAvatarObjectKey() != null;
        if (!hasAtLeastOneField) {
            throw new IllegalArgumentException("At least one profile field must be provided");
        }

        // Step 4: Apply only the supplied fields; omitted fields keep their current values
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getMajor() != null) {
            user.setMajor(request.getMajor());
        }
        if (request.getYearOfStudy() != null) {
            user.setYearOfStudy(request.getYearOfStudy());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }
        if (request.getAvatarObjectKey() != null) {
            user.setAvatarObjectKey(request.getAvatarObjectKey());
        }

        // Step 5: Persist; @Version increments automatically and updatedAt is refreshed server-side
        user.setUpdatedAt(OffsetDateTime.now());
        return userRepository.save(user);
    }

    /** Verifies the current password before storing a newly BCrypt-hashed password. */
    public void changePassword(UUID ownerId, ChangePasswordRequest request) {
        User user = loadUser(ownerId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from your current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getNotificationPreferences(UUID ownerId) {
        return toNotificationPreferences(loadUser(ownerId));
    }

    /** Stores all preference switches together so the Settings page cannot leave a partial state. */
    public NotificationPreferencesResponse updateNotificationPreferences(
            UUID ownerId,
            NotificationPreferencesUpdateRequest request
    ) {
        User user = loadUser(ownerId);
        user.setSessionRemindersEnabled(request.getSessionRemindersEnabled());
        user.setSessionRequestNotificationsEnabled(request.getSessionRequestNotificationsEnabled());
        user.setMessageAlertsEnabled(request.getMessageAlertsEnabled());
        user.setUpdatedAt(OffsetDateTime.now());
        return toNotificationPreferences(userRepository.save(user));
    }

    private User loadUser(UUID ownerId) {
        return userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + ownerId));
    }

    private NotificationPreferencesResponse toNotificationPreferences(User user) {
        return new NotificationPreferencesResponse(
                !Boolean.FALSE.equals(user.getSessionRemindersEnabled()),
                !Boolean.FALSE.equals(user.getSessionRequestNotificationsEnabled()),
                !Boolean.FALSE.equals(user.getMessageAlertsEnabled())
        );
    }

    // Compares the caller-supplied If-Match version against the persisted entity version
    private void requireMatchingVersion(User user, Long expectedVersion) {
        if (expectedVersion == null) {
            throw new IllegalArgumentException("If-Match header carrying the current version is required");
        }
        if (!expectedVersion.equals(user.getVersion())) {
            throw new IllegalArgumentException(
                    "Version mismatch: expected " + expectedVersion + " but current is " + user.getVersion());
        }
    }
}
