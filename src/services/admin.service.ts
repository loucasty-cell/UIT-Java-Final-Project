import { api } from "@/lib/api-client";
import {
  AdminAuditEventResponse,
  AdminDashboardMetricsResponse,
  AdminDisputeResponse,
  AdminPlatformSettingsResponse,
  AdminUserResponse,
  PageResponse,
  PaginationParams,
  ResolveDisputeRequest,
} from "@/types/api";

export interface AccountWarningRequest {
  category: "VIOLENT_CONTENT" | "FRAUDULENT_ACTIVITY" | "SPAM" | "HARASSMENT" | string;
  reason: string;
}

export interface AccountWarningResponse {
  id: string;
  userId: string;
  category: string;
  reason: string;
  createdAt: string;
}

export interface ReportResponse {
  id: string;
  reporterId: string;
  targetType: "FORUM_POST" | "FORUM_COMMENT" | "SESSION_MESSAGE" | "USER" | string;
  targetId: string;
  reason: string;
  status: "OPEN" | "DISMISSED" | "ACTIONED" | string;
  createdAt: string;
}

export const adminService = {
  /**
   * Get overall platform metrics and dashboard figures
   * GET /api/v1/admin/dashboard or /api/v1/admin/dashboard/metrics
   */
  async getDashboardMetrics(): Promise<AdminDashboardMetricsResponse> {
    try {
      return await api.get<AdminDashboardMetricsResponse>("/api/v1/admin/dashboard");
    } catch {
      return api.get<AdminDashboardMetricsResponse>("/api/v1/admin/dashboard/metrics");
    }
  },

  /**
   * List platform users with pagination
   * GET /api/v1/admin/users
   */
  async getUsers(
    params: PaginationParams = { page: 0, size: 20 }
  ): Promise<PageResponse<AdminUserResponse>> {
    return api.get<PageResponse<AdminUserResponse>>("/api/v1/admin/users", params);
  },

  /**
   * Manually adjust a user's points balance
   * POST /api/v1/admin/users/{userId}/wallet-adjustments
   */
  async adjustUserPoints(
    userId: string,
    delta: number,
    reason: string
  ): Promise<void> {
    try {
      await api.post<void>(`/api/v1/admin/users/${userId}/wallet-adjustments`, {
        targetUserId: userId,
        delta,
        reason,
      });
    } catch {
      await api.post<void>(`/api/v1/admin/users/${userId}/points/adjust`, {
        delta,
        reason,
      });
    }
  },

  /**
   * Issue an account warning to a user
   * POST /api/v1/admin/users/{userId}/warnings
   */
  async issueWarning(
    userId: string,
    data: AccountWarningRequest
  ): Promise<AccountWarningResponse> {
    return api.post<AccountWarningResponse>(
      `/api/v1/admin/users/${userId}/warnings`,
      data
    );
  },

  /**
   * Update user's account status (ACTIVE, WARNED, SUSPENDED, DISABLED)
   * PATCH /api/v1/admin/users/{userId}/status
   */
  async updateStatus(
    userId: string,
    status: "ACTIVE" | "WARNED" | "SUSPENDED" | "DISABLED" | string,
    reason?: string
  ): Promise<AdminUserResponse> {
    return api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/status`, {
      status,
      reason,
    });
  },

  /**
   * Freeze / Suspend user account
   * POST /api/v1/admin/users/{id}/freeze
   */
  async freezeUser(id: string, reason: string): Promise<void> {
    try {
      await this.updateStatus(id, "SUSPENDED", reason);
    } catch {
      await api.post<void>(`/api/v1/admin/users/${id}/freeze`, { reason });
    }
  },

  /**
   * Unfreeze / Activate user account
   * POST /api/v1/admin/users/{id}/unfreeze
   */
  async unfreezeUser(id: string, reason: string): Promise<void> {
    try {
      await this.updateStatus(id, "ACTIVE", reason);
    } catch {
      await api.post<void>(`/api/v1/admin/users/${id}/unfreeze`, { reason });
    }
  },

  /**
   * Ban / Disable user account
   * POST /api/v1/admin/users/{id}/ban
   */
  async banUser(id: string, reason: string): Promise<void> {
    try {
      await this.updateStatus(id, "DISABLED", reason);
    } catch {
      await api.post<void>(`/api/v1/admin/users/${id}/ban`, { reason });
    }
  },

  /**
   * Update user roles
   * PATCH /api/v1/admin/users/{id}/role
   */
  async updateUserRole(id: string, roles: string[]): Promise<void> {
    return api.patch<void>(`/api/v1/admin/users/${id}/role`, { roles });
  },

  /**
   * List open and resolved dispute cases
   * GET /api/v1/admin/disputes
   */
  async getDisputes(
    status?: string,
    params?: PaginationParams
  ): Promise<AdminDisputeResponse[]> {
    const res = await api.get<any>("/api/v1/admin/disputes", { status, ...params });
    if (res && Array.isArray(res.content)) {
      return res.content;
    }
    return Array.isArray(res) ? res : [];
  },

  /**
   * Resolve a disputed session with escrow allocation
   * POST /api/v1/admin/disputes/{disputeId}/resolve
   */
  async resolveDispute(
    disputeId: string,
    data: ResolveDisputeRequest
  ): Promise<void> {
    return api.post<void>(`/api/v1/admin/disputes/${disputeId}/resolve`, data);
  },

  /**
   * Get platform moderation reports
   * GET /api/v1/admin/reports
   */
  async getReports(
    status?: string,
    targetType?: string,
    params?: PaginationParams
  ): Promise<PageResponse<ReportResponse>> {
    return api.get<PageResponse<ReportResponse>>("/api/v1/admin/reports", {
      status,
      targetType,
      ...params,
    });
  },

  /**
   * Dismiss a reported item
   * POST /api/v1/admin/reports/{reportId}/dismiss
   */
  async dismissReport(reportId: string, reason: string): Promise<ReportResponse> {
    return api.post<ReportResponse>(`/api/v1/admin/reports/${reportId}/dismiss`, {
      reason,
    });
  },

  /**
   * Remove reported content
   * POST /api/v1/admin/reports/{reportId}/remove-content
   */
  async removeReportedContent(
    reportId: string,
    reason: string
  ): Promise<ReportResponse> {
    return api.post<ReportResponse>(
      `/api/v1/admin/reports/${reportId}/remove-content`,
      { reason }
    );
  },

  /**
   * Get platform wide settings
   * GET /api/v1/admin/settings
   */
  async getSettings(): Promise<AdminPlatformSettingsResponse> {
    return api.get<AdminPlatformSettingsResponse>("/api/v1/admin/settings");
  },

  /**
   * Update platform wide settings
   * PATCH /api/v1/admin/settings or PUT
   */
  async updateSettings(
    data: Partial<AdminPlatformSettingsResponse>
  ): Promise<AdminPlatformSettingsResponse> {
    try {
      return await api.patch<AdminPlatformSettingsResponse>(
        "/api/v1/admin/settings",
        data
      );
    } catch {
      return api.put<AdminPlatformSettingsResponse>(
        "/api/v1/admin/settings",
        data
      );
    }
  },

  /**
   * Get system audit logs
   * GET /api/v1/admin/audit-events or /api/v1/admin/audit-logs
   */
  async getAuditLogs(
    params: PaginationParams & { actorId?: string; targetType?: string } = {
      page: 0,
      size: 20,
    }
  ): Promise<PageResponse<AdminAuditEventResponse>> {
    try {
      return await api.get<PageResponse<AdminAuditEventResponse>>(
        "/api/v1/admin/audit-events",
        params
      );
    } catch {
      return api.get<PageResponse<AdminAuditEventResponse>>(
        "/api/v1/admin/audit-logs",
        params
      );
    }
  },
};
