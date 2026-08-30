package com.skillbridge.user.application.command;

import com.skillbridge.shared.infrastructure.storage.StorageService;
import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.user.api.dto.response.CertificateResponse;
import com.skillbridge.user.api.mapper.CertificateMapper;
import com.skillbridge.user.domain.entity.Certificate;
import com.skillbridge.user.infrastructure.persistence.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CertificateService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    private final CertificateRepository certificateRepository;
    private final SkillRepository skillRepository;
    private final StorageService storageService;
    private final CertificateMapper certificateMapper;

    public CertificateResponse uploadCertificate(UUID skillId, MultipartFile file) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        if (skillId == null) {
            throw new IllegalArgumentException("Skill ID must not be null");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Certificate file must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Certificate file size must not exceed 5 MB");
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equalsIgnoreCase("application/pdf") && !(originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")))) {
            throw new IllegalArgumentException("Only PDF certificates are allowed");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + skillId));

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded file", e);
        }

        // Delete existing certificate storage if updating
        certificateRepository.findByUserIdAndSkillId(currentUserId, skillId).ifPresent(existing -> {
            storageService.delete(existing.getStorageKey());
            certificateRepository.delete(existing);
            certificateRepository.flush();
        });

        String storageKey = storageService.store(originalFilename, content, "application/pdf");

        Certificate cert = new Certificate();
        cert.setId(UUID.randomUUID());
        cert.setUserId(currentUserId);
        cert.setSkillId(skillId);
        cert.setFileName(originalFilename != null ? originalFilename : "certificate.pdf");
        cert.setStorageKey(storageKey);
        cert.setContentType("application/pdf");
        cert.setFileSize(file.getSize());

        Certificate saved = certificateRepository.save(cert);
        return certificateMapper.toResponse(saved, skill);
    }

    @Transactional(readOnly = true)
    public byte[] downloadCertificate(UUID userId, UUID skillId) {
        Certificate cert = certificateRepository.findByUserIdAndSkillId(userId, skillId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found for user: " + userId + " and skill: " + skillId));

        return storageService.load(cert.getStorageKey());
    }

    @Transactional(readOnly = true)
    public List<CertificateResponse> getCertificates(UUID userId) {
        return certificateRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(cert -> {
                    Skill skill = skillRepository.findById(cert.getSkillId()).orElse(null);
                    return certificateMapper.toResponse(cert, skill);
                })
                .toList();
    }

    public void deleteCertificate(UUID skillId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Certificate cert = certificateRepository.findByUserIdAndSkillId(currentUserId, skillId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found for skill: " + skillId));

        storageService.delete(cert.getStorageKey());
        certificateRepository.delete(cert);
    }
}

