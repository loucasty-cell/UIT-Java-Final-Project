package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.PlatformSettingsUpdateRequest;
import com.skillbridge.admin.api.dto.response.PlatformSettingsResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.PlatformSetting;
import com.skillbridge.admin.infrastructure.persistence.PlatformSettingRepository;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class PlatformSettingsService {

    private final PlatformSettingRepository platformSettingRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public PlatformSettingsResponse getSettings() {
        PlatformSetting setting = platformSettingRepository.findTopByOrderByUpdatedAtDesc()
                .orElseGet(() -> {
                    PlatformSetting defaultSetting = new PlatformSetting();
                    defaultSetting.setId(UUID.randomUUID());
                    defaultSetting.setRegistrationBonus(50);
                    defaultSetting.setForumContributionReward(5);
                    defaultSetting.setEscrowReleaseHours(18);
                    defaultSetting.setUpdatedAt(OffsetDateTime.now());
                    return defaultSetting;
                });

        return adminMapper.toResponse(setting);
    }

    public PlatformSettingsResponse updateSettings(PlatformSettingsUpdateRequest request) {
        UUID currentAdminId = SecurityUtils.getCurrentUserId();

        PlatformSetting setting = platformSettingRepository.findTopByOrderByUpdatedAtDesc()
                .orElseGet(() -> {
                    PlatformSetting newSetting = new PlatformSetting();
                    newSetting.setId(UUID.randomUUID());
                    newSetting.setRegistrationBonus(50);
                    newSetting.setForumContributionReward(5);
                    newSetting.setEscrowReleaseHours(18);
                    newSetting.setUpdatedAt(OffsetDateTime.now());
                    return newSetting;
                });

        String beforeSummary = String.format("Bonus: %d, ForumReward: %d, EscrowHours: %d",
                setting.getRegistrationBonus(), setting.getForumContributionReward(), setting.getEscrowReleaseHours());

        if (request.getRegistrationBonus() != null) {
            setting.setRegistrationBonus(request.getRegistrationBonus());
        }
        if (request.getForumContributionReward() != null) {
            setting.setForumContributionReward(request.getForumContributionReward());
        }
        if (request.getEscrowReleaseHours() != null) {
            setting.setEscrowReleaseHours(request.getEscrowReleaseHours());
        }

        setting.setUpdatedBy(currentAdminId);
        setting.setUpdatedAt(OffsetDateTime.now());

        PlatformSetting saved = platformSettingRepository.save(setting);

        String afterSummary = String.format("Bonus: %d, ForumReward: %d, EscrowHours: %d",
                saved.getRegistrationBonus(), saved.getForumContributionReward(), saved.getEscrowReleaseHours());

        adminAuditService.logEvent(
                currentAdminId,
                "UPDATE_PLATFORM_SETTINGS",
                "PLATFORM_SETTINGS",
                saved.getId(),
                beforeSummary,
                afterSummary,
                "Admin updated platform defaults",
                null
        );

        return adminMapper.toResponse(saved);
    }
}
