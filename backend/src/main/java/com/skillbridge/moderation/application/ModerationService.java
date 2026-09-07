package com.skillbridge.moderation.application;

import com.skillbridge.admin.domain.entity.Report;
import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.admin.domain.model.ReportTargetType;
import com.skillbridge.admin.infrastructure.persistence.ReportRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.forum.infrastructure.persistence.ForumCommentRepository;
import com.skillbridge.forum.infrastructure.persistence.ForumPostRepository;
import com.skillbridge.moderation.api.dto.request.FlagContentRequest;
import com.skillbridge.moderation.api.dto.request.ResolveReportRequest;
import com.skillbridge.moderation.api.dto.response.ModerationReportResponse;
import com.skillbridge.moderation.api.mapper.ModerationMapper;
import com.skillbridge.review.infrastructure.persistence.ReviewRepository;
import lombok.RequiredArgsConstructor;
import com.skillbridge.shared.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ModerationService {

    private final ReportRepository reportRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ModerationMapper moderationMapper;

    public ModerationReportResponse flagContent(FlagContentRequest request) {
        UUID reporterId = SecurityUtils.getCurrentUserId();
        if (!userRepository.existsById(reporterId)) {
            throw new IllegalArgumentException("Reporter not found: " + reporterId);
        }
        validateTarget(request.getTargetType(), request.getTargetId());

        OffsetDateTime now = OffsetDateTime.now();
        Report report = new Report();
        report.setId(UUID.randomUUID());
        report.setReporterId(reporterId);
        report.setTargetType(request.getTargetType());
        report.setTargetId(request.getTargetId());
        report.setReason(request.getReason());
        report.setDetails(request.getDetails());
        report.setStatus(ReportStatus.OPEN);
        report.setCreatedAt(now);
        report.setUpdatedAt(now);

        return moderationMapper.toResponse(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<ModerationReportResponse> getReports(ReportStatus status) {
        List<Report> reports = status != null
                ? reportRepository.findByStatusOrderByCreatedAtDesc(status)
                : reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream()
                .map(moderationMapper::toResponse)
                .toList();
    }

    public ModerationReportResponse resolveReport(UUID reportId, ResolveReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        if (request.getStatus() == ReportStatus.OPEN) {
            throw new IllegalArgumentException("Resolved report status must be DISMISSED or ACTIONED");
        }
        if (!userRepository.existsById(request.getModeratorId())) {
            throw new IllegalArgumentException("Moderator not found: " + request.getModeratorId());
        }

        report.setStatus(request.getStatus());
        report.setActionTaken(request.getActionTaken());
        report.setResolvedBy(request.getModeratorId());
        report.setResolvedAt(OffsetDateTime.now());
        report.setUpdatedAt(OffsetDateTime.now());
        if (request.getNote() != null && !request.getNote().isBlank()) {
            report.setDetails(report.getDetails() == null ? request.getNote() : report.getDetails() + "\n" + request.getNote());
        }

        return moderationMapper.toResponse(reportRepository.save(report));
    }

    private void validateTarget(ReportTargetType targetType, UUID targetId) {
        boolean exists = switch (targetType) {
            case FORUM_POST -> forumPostRepository.existsById(targetId);
            case FORUM_COMMENT -> forumCommentRepository.existsById(targetId);
            case REVIEW -> reviewRepository.existsById(targetId);
            case USER, USER_PROFILE -> userRepository.existsById(targetId);
            case SESSION_MESSAGE -> true;
        };

        if (!exists) {
            throw new IllegalArgumentException("Reported target not found: " + targetId);
        }
    }
}
