package com.skillbridge.user.api.controller;

import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.user.api.dto.response.CertificateResponse;
import com.skillbridge.user.application.command.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/api/v1/me/skills/{skillId}/certificate")
    @ResponseStatus(HttpStatus.CREATED)
    public CertificateResponse uploadCertificate(
            @PathVariable UUID skillId,
            @RequestParam("file") MultipartFile file
    ) {
        return certificateService.uploadCertificate(skillId, file);
    }

    @GetMapping("/api/v1/me/certificates")
    public List<CertificateResponse> getMyCertificates() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        return certificateService.getCertificates(currentUserId);
    }

    @GetMapping("/api/v1/users/{userId}/skills/{skillId}/certificate")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable UUID userId,
            @PathVariable UUID skillId
    ) {
        byte[] pdfBytes = certificateService.downloadCertificate(userId, skillId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "certificate.pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @DeleteMapping("/api/v1/me/skills/{skillId}/certificate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCertificate(@PathVariable UUID skillId) {
        certificateService.deleteCertificate(skillId);
    }
}

