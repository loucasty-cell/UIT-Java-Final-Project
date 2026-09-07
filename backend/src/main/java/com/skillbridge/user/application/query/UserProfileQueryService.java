package com.skillbridge.user.application.query;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.user.api.dto.response.MyProfileResponse;
import com.skillbridge.user.api.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// UserProfileQueryService: Read-only owner-facing profile projection
// Linkage: ProfileController GET /api/v1/me -> UserProfileQueryService -> UserRepository, UserRoleRepository
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserProfileQueryService {

    private final UserRepository userRepository;

    private final UserRoleRepository userRoleRepository;

    private final UserMapper userMapper;

    // Returns the caller's safe profile summary; roles come from PostgreSQL, never JWT claims
    public MyProfileResponse getMyProfile(UUID ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + ownerId));
        List<String> roles = loadRoles(ownerId);
        return userMapper.toMyProfileResponse(user, roles);
    }

    // Rebuilds the same projection for an updated entity so PATCH can echo the new state
    public MyProfileResponse toProfileResponse(User user) {
        List<String> roles = loadRoles(user.getId());
        return userMapper.toMyProfileResponse(user, roles);
    }

    private List<String> loadRoles(UUID userId) {
        return userRoleRepository.findByUserId(userId).stream()
                .map(UserRole::getRole)
                .toList();
    }
}
