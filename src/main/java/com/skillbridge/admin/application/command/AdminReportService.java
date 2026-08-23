package com.skillbridge.admin.application.command;

import com.skillbridge.admin.api.dto.request.AdminReasonRequest;
import com.skillbridge.admin.api.dto.response.ReportResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Report;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.infrastructure.persistence.ReportRepository;
import com.skillbridge.forum.domain.entity.ForumPost;
import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import com.skillbridge.forum.infrastructure.persistence.ForumPostRepository;
import com.skillbridge.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminReportService {

    private final ReportRepository reportRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final AdminMapper adminMapper;
    private final AdminAuditService adminAuditService;

    public ReportResponse dismissReport(UUID reportId, AdminReasonRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));

        UUID currentAdminId = SecurityUtils.getCurrentUserId();
        String beforeStatus = report.getStatus().name();

        if (report.getStatus() != ReportStatus.OPEN) {
            // Idempotent return if already resolved
            return adminMapper.toResponse(report);
        }

        report.setStatus(ReportStatus.DISMISSED);
        report.setActionTaken("DISMISSED");
        report.setResolvedBy(currentAdminId);
        report.setResolvedAt(OffsetDateTime.now());
        report.setUpdatedAt(OffsetDateTime.now());

        Report saved = reportRepository.save(report);

        adminAuditService.logEvent(
                currentAdminId,
                "DISMISS_REPORT",
                "REPORT",
                reportId,
                "Status: " + beforeStatus,
                "Status: DISMISSED",
                request.getReason(),
                null
        );

        return adminMapper.toResponse(saved);
    }

    public ReportResponse removeContent(UUID reportId, AdminReasonRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));

        UUID currentAdminId = SecurityUtils.getCurrentUserId();
        String beforeStatus = report.getStatus().name();

        if (report.getStatus() == ReportStatus.ACTIONED) {
            // Idempotent return if already actioned
            return adminMapper.toResponse(report);
        }

        // Soft-delete target content based on target type
        switch (report.getTargetType()) {
            case FORUM_POST -> {
                forumPostRepository.findById(report.getTargetId()).ifPresent(post -> {
                    post.setActive(false);
                    post.setUpdatedAt(OffsetDateTime.now());
                    forumPostRepository.save(post);
                });
            }
            case FORUM_COMMENT -> {
                forumCommentRepository.findById(report.getTargetId()).ifPresent(comment -> {
                    forumCommentRepository.delete(comment);
                });
            }
            default -> {
                // Log and proceed
            }
        }

        report.setStatus(ReportStatus.ACTIONED);
        report.setActionTaken("REMOVED_CONTENT");
        report.setResolvedBy(currentAdminId);
        report.setResolvedAt(OffsetDateTime.now());
        report.setUpdatedAt(OffsetDateTime.now());

        Report saved = reportRepository.save(report);

        adminAuditService.logEvent(
                currentAdminId,
                "REMOVE_REPORTED_CONTENT",
                report.getTargetType().name(),
                report.getTargetId(),
                "Status: " + beforeStatus,
                "Status: ACTIONED (Content Removed)",
                request.getReason(),
                null
        );

        return adminMapper.toResponse(saved);
    }
}
