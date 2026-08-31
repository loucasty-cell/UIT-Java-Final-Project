package com.skillbridge.moderation.api.controller;

import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.moderation.api.dto.request.FlagContentRequest;
import com.skillbridge.moderation.api.dto.request.ResolveReportRequest;
import com.skillbridge.moderation.api.dto.response.ModerationReportResponse;
import com.skillbridge.moderation.application.ModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/moderation", "/api/v1/moderation"})
@CrossOrigin(origins = "http://localhost:8081")
@RequiredArgsConstructor
public class ModerationController {

    private final ModerationService moderationService;

    @PostMapping("/reports")
    public ResponseEntity<ModerationReportResponse> flagContent(
            @Valid @RequestBody FlagContentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moderationService.flagContent(request));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ModerationReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status
    ) {
        return ResponseEntity.ok(moderationService.getReports(status));
    }

    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ModerationReportResponse> resolveReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody ResolveReportRequest request
    ) {
        return ResponseEntity.ok(moderationService.resolveReport(reportId, request));
    }
}
