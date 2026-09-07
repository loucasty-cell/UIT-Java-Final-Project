package com.skillbridge.admin.api.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long heldEscrowPoints;
    private Long openReports;
    private Long activeDisputes;
    private Long activeSessions;
}
