package com.skillbridge.user.api.mapper;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.user.api.dto.response.CertificateResponse;
import com.skillbridge.user.domain.entity.Certificate;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapper {

    public CertificateResponse toResponse(Certificate certificate, Skill skill) {
        if (certificate == null) {
            return null;
        }

        SkillSummaryResponse skillSummary = null;
        if (skill != null) {
            skillSummary = new SkillSummaryResponse();
            skillSummary.setId(skill.getId());
            skillSummary.setName(skill.getName());
            skillSummary.setSlug(skill.getName().toLowerCase().replace(" ", "-"));
        }

        String downloadUrl = "/api/v1/users/" + certificate.getUserId() + "/skills/" + certificate.getSkillId() + "/certificate";

        return CertificateResponse.builder()
                .id(certificate.getId())
                .userId(certificate.getUserId())
                .skill(skillSummary)
                .fileName(certificate.getFileName())
                .downloadUrl(downloadUrl)
                .contentType(certificate.getContentType())
                .fileSize(certificate.getFileSize())
                .createdAt(certificate.getCreatedAt())
                .updatedAt(certificate.getUpdatedAt())
                .version(certificate.getVersion())
                .build();
    }
}

