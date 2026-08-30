package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.dto.response.AdminUserResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminUserService {

    private final AccountWarningRepository accountWarningRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;
    private final com.skillbridge.auth.infrastructure.persistence.UserRepository userRepository;
    private final com.skillbridge.auth.infrastructure.persistence.UserRoleRepository userRoleRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(user -> {
            List<String> roles = userRoleRepository.findByUserId(user.getId())
                    .stream().map(com.skillbridge.auth.domain.entity.UserRole::getRole).toList();
            long warningCount = accountWarningRepository.countByUserId(user.getId());

            return AdminUserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .status(user.getStatus() != null ? user.getStatus() : AccountStatus.ACTIVE)
                    .roles(roles.isEmpty() ? List.of("USER") : roles)
                    .major(user.getMajor())
                    .yearOfStudy(user.getYearOfStudy())
                    .warningCount(warningCount)
                    .reportCount(0L)
                    .completedSessionCount(0L)
                    .availablePoints(30)
                    .heldPoints(0)
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .version(1L)
                    .build();
        }).toList();
    }

    public AccountWarningResponse issueWarning(UUID userId, AccountWarningRequest request) {
        UUID currentAdminId = SecurityUtils.getCurrentUserId();

        AccountWarning warning = new AccountWarning();
        warning.setId(UUID.randomUUID());
        warning.setUserId(userId);
        warning.setAdminId(currentAdminId);
        warning.setReason(request.getReason());
        warning.setMessage(request.getMessage());
        warning.setCreatedAt(OffsetDateTime.now());

        AccountWarning saved = accountWarningRepository.save(warning);

        adminAuditService.logEvent(
                currentAdminId,
                "ISSUE_WARNING",
                "USER",
                userId,
                null,
                "Warning Reason: " + request.getReason().name(),
                request.getMessage(),
                null
        );

        return adminMapper.toResponse(saved);
    }

    public AdminUserResponse updateUserStatus(UUID userId, AccountStatusUpdateRequest request, Long ifMatchVersion) {
        UUID currentAdminId = SecurityUtils.getCurrentUserId();

        long warningCount = accountWarningRepository.countByUserId(userId);

        adminAuditService.logEvent(
                currentAdminId,
                "UPDATE_ACCOUNT_STATUS",
                "USER",
                userId,
                "Status: UNKNOWN",
                "Status: " + request.getStatus().name(),
                request.getReason(),
                null
        );

        return AdminUserResponse.builder()
                .id(userId)
                .email("user-" + userId.toString().substring(0, 8) + "@skillbridge.edu")
                .firstName("User")
                .lastName(userId.toString().substring(0, 4))
                .status(request.getStatus())
                .roles(Collections.singletonList("USER"))
                .major("Computer Science")
                .yearOfStudy(3)
                .warningCount(warningCount)
                .reportCount(0L)
                .completedSessionCount(0L)
                .availablePoints(50)
                .heldPoints(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .version(ifMatchVersion != null ? ifMatchVersion + 1 : 1L)
                .build();
    }
}
