package com.skillbridge.moderation.api.controller;

import com.skillbridge.admin.domain.model.ReportStatus;
import com.skillbridge.moderation.api.dto.request.FlagContentRequest;
import com.skillbridge.moderation.api.dto.request.ResolveReportRequest;
import com.skillbridge.moderation.api.dto.response.ModerationReportResponse;
import com.skillbridge.moderation.application.ModerationService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ModerationControllerTest {

    @Test
    void exposesModerationEndpoints() {
        RecordingModerationService service = new RecordingModerationService();
        ModerationController controller = new ModerationController(service);
        FlagContentRequest flagRequest = new FlagContentRequest();
        ResolveReportRequest resolveRequest = new ResolveReportRequest();
        UUID reportId = UUID.randomUUID();

        assertEquals(HttpStatus.CREATED, controller.flagContent(flagRequest).getStatusCode());
        assertEquals(flagRequest, service.flagRequest);
        assertEquals(1, controller.getReports(ReportStatus.OPEN).getBody().size());
        assertEquals(ReportStatus.OPEN, service.status);
        assertEquals(ReportStatus.ACTIONED, controller.resolveReport(reportId, resolveRequest).getBody().getStatus());
        assertEquals(reportId, service.reportId);
        assertEquals(resolveRequest, service.resolveRequest);
    }

    private static class RecordingModerationService extends ModerationService {
        private FlagContentRequest flagRequest;
        private ReportStatus status;
        private UUID reportId;
        private ResolveReportRequest resolveRequest;

        RecordingModerationService() {
            super(null, null, null, null, null, null);
        }

        @Override
        public ModerationReportResponse flagContent(FlagContentRequest request) {
            this.flagRequest = request;
            return response(ReportStatus.OPEN);
        }

        @Override
        public List<ModerationReportResponse> getReports(ReportStatus status) {
            this.status = status;
            return List.of(response(ReportStatus.OPEN));
        }

        @Override
        public ModerationReportResponse resolveReport(UUID reportId, ResolveReportRequest request) {
            this.reportId = reportId;
            this.resolveRequest = request;
            return response(ReportStatus.ACTIONED);
        }

        private ModerationReportResponse response(ReportStatus status) {
            ModerationReportResponse response = new ModerationReportResponse();
            response.setId(UUID.randomUUID());
            response.setStatus(status);
            return response;
        }
    }
}
