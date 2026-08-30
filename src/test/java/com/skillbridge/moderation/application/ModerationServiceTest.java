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
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ModerationServiceTest {

    @Test
    void flagsListsAndResolvesReports() {
        Map<UUID, Report> reports = new LinkedHashMap<>();
        UUID reporterId = UUID.randomUUID();
        UUID targetId = UUID.randomUUID();
        UUID moderatorId = UUID.randomUUID();
        ModerationService service = new ModerationService(
                reportRepository(reports),
                existsRepository(ForumPostRepository.class),
                existsRepository(ForumCommentRepository.class),
                existsRepository(ReviewRepository.class),
                existsRepository(UserRepository.class),
                new ModerationMapper()
        );

        ModerationReportResponse created = service.flagContent(flagRequest(reporterId, targetId));

        assertEquals(ReportStatus.OPEN, created.getStatus());
        assertEquals(1, service.getReports(ReportStatus.OPEN).size());

        ResolveReportRequest resolveRequest = new ResolveReportRequest();
        resolveRequest.setModeratorId(moderatorId);
        resolveRequest.setStatus(ReportStatus.ACTIONED);
        resolveRequest.setActionTaken("REMOVED_CONTENT");
        resolveRequest.setNote("Confirmed");
        ModerationReportResponse resolved = service.resolveReport(created.getId(), resolveRequest);

        assertEquals(ReportStatus.ACTIONED, resolved.getStatus());
        assertEquals(moderatorId, resolved.getResolvedBy());
    }

    private FlagContentRequest flagRequest(UUID reporterId, UUID targetId) {
        FlagContentRequest request = new FlagContentRequest();
        request.setReporterId(reporterId);
        request.setTargetType(ReportTargetType.REVIEW);
        request.setTargetId(targetId);
        request.setReason("Abuse");
        request.setDetails("Bad feedback");
        return request;
    }

    private ReportRepository reportRepository(Map<UUID, Report> reports) {
        return ReportRepository.class.cast(Proxy.newProxyInstance(
                ReportRepository.class.getClassLoader(),
                new Class<?>[]{ReportRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "save" -> {
                        Report report = (Report) args[0];
                        reports.put(report.getId(), report);
                        yield report;
                    }
                    case "findById" -> Optional.ofNullable(reports.get((UUID) args[0]));
                    case "findAllByOrderByCreatedAtDesc" -> List.copyOf(reports.values());
                    case "findByStatusOrderByCreatedAtDesc" -> reports.values().stream()
                            .filter(report -> report.getStatus() == args[0])
                            .toList();
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "toString" -> "ReportRepository test proxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        ));
    }

    private <T> T existsRepository(Class<T> type) {
        return type.cast(Proxy.newProxyInstance(
                type.getClassLoader(),
                new Class<?>[]{type},
                (proxy, method, args) -> switch (method.getName()) {
                    case "existsById" -> true;
                    case "equals" -> proxy == args[0];
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "toString" -> type.getSimpleName() + " test proxy";
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        ));
    }
}
