package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.AccountStatusUpdateRequest;
import com.skillbridge.admin.api.dto.request.AccountWarningRequest;
import com.skillbridge.admin.api.dto.response.AccountWarningResponse;
import com.skillbridge.admin.api.dto.response.AdminUserResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.AccountWarning;
import com.skillbridge.admin.infrastructure.persistence.AccountWarningRepository;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminUserService {

    private final AccountWarningRepository accountWarningRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

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
