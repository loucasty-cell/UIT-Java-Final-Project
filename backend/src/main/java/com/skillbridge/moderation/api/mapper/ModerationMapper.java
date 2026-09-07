package com.skillbridge.moderation.api.mapper;

import com.skillbridge.admin.domain.entity.Report;
import com.skillbridge.moderation.api.dto.response.ModerationReportResponse;
import org.springframework.stereotype.Component;

@Component
public class ModerationMapper {

    public ModerationReportResponse toResponse(Report report) {
        ModerationReportResponse response = new ModerationReportResponse();
        response.setId(report.getId());
        response.setReporterId(report.getReporterId());
        response.setTargetType(report.getTargetType());
        response.setTargetId(report.getTargetId());
        response.setReason(report.getReason());
        response.setDetails(report.getDetails());
        response.setStatus(report.getStatus());
        response.setActionTaken(report.getActionTaken());
        response.setResolvedBy(report.getResolvedBy());
        response.setResolvedAt(report.getResolvedAt());
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());
        response.setVersion(report.getVersion());
        return response;
    }
}
