import { api } from "@/lib/api-client";

export interface FlagContentRequest {
  targetType: "FORUM_POST" | "FORUM_COMMENT" | "SESSION_MESSAGE" | "USER" | string;
  targetId: string;
  reason: string;
}

export interface ModerationReportResponse {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED" | string;
  createdAt: string;
}

export const moderationService = {
  /**
   * Report inappropriate content or users
   * POST /api/v1/moderation/reports
   */
  async flagContent(data: FlagContentRequest): Promise<ModerationReportResponse> {
    return api.post<ModerationReportResponse>("/api/v1/moderation/reports", data);
  },

  /**
   * Get user's submitted moderation reports
   * GET /api/v1/moderation/reports
   */
  async getMyReports(): Promise<ModerationReportResponse[]> {
    return api.get<ModerationReportResponse[]>("/api/v1/moderation/reports");
  },
};
