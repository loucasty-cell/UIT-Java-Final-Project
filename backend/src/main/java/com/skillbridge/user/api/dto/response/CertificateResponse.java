package com.skillbridge.user.api.dto.response;

import com.skillbridge.shared.api.dto.response.SkillSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponse {

    private UUID id;
    private UUID userId;
    private SkillSummaryResponse skill;
    private String fileName;
    private String downloadUrl;
    private String contentType;
    private Long fileSize;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}

