import { api } from "@/lib/api-client";

export interface MentorApplicationResponse {
  id: string;
  userId: string;
  applicantName?: string;
  applicantEmail?: string;
  motivation: string;
  experienceSummary: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMentorApplicationRequest {
  motivation: string;
  experienceSummary: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
}

export interface RejectMentorApplicationRequest {
  reason?: string;
}

export const mentorApplicationService = {
  /**
   * Get authenticated user's current mentor application status
   * GET /api/v1/me/mentor-application
   */
  async getMyApplication(): Promise<MentorApplicationResponse> {
    return api.get<MentorApplicationResponse>("/api/v1/me/mentor-application");
  },

  /**
   * Submit a new mentor application
   * POST /api/v1/me/mentor-application
   */
  async applyToBecomeMentor(
    data: CreateMentorApplicationRequest
  ): Promise<MentorApplicationResponse> {
    return api.post<MentorApplicationResponse>(
      "/api/v1/me/mentor-application",
      data
    );
  },

  /**
   * Admin: List pending mentor applications
   * GET /api/v1/admin/mentor-applications
   */
  async getPendingApplications(): Promise<MentorApplicationResponse[]> {
    return api.get<MentorApplicationResponse[]>(
      "/api/v1/admin/mentor-applications"
    );
  },

  /**
   * Admin: Approve mentor application
   * POST /api/v1/admin/mentor-applications/{id}/approve
   */
  async approveApplication(id: string): Promise<MentorApplicationResponse> {
    return api.post<MentorApplicationResponse>(
      `/api/v1/admin/mentor-applications/${id}/approve`
    );
  },

  /**
   * Admin: Reject mentor application with feedback
   * POST /api/v1/admin/mentor-applications/{id}/reject
   */
  async rejectApplication(
    id: string,
    reason?: string
  ): Promise<MentorApplicationResponse> {
    return api.post<MentorApplicationResponse>(
      `/api/v1/admin/mentor-applications/${id}/reject`,
      { reason }
    );
  },
};
