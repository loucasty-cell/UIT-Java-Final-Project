import { api } from "@/lib/api-client";
import { handleMockApiRequest } from "@/lib/mock-api";
import {
  CreateMentorOfferingRequest,
  MentorDetailResponse,
  MentorOfferingResponse,
  MentorSearchFilters,
  MentorSearchResponse,
  PageResponse,
  PaginationParams,
  ReviewResponse,
  UpdateMentorOfferingRequest,
} from "@/types/api";

export interface AvailabilitySlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityResponse {
  mentorId: string;
  slots: AvailabilitySlot[];
}

export const mentorsService = {
  /**
   * Search and filter mentors
   * GET /api/v1/mentors?skillId={}&search={}&minRating={}
   * PHASE 0: Add mock fallback for mentors page (only page allowed to use mock)
   */
  async searchMentors(
    filters: MentorSearchFilters = {}
  ): Promise<MentorSearchResponse[] | PageResponse<MentorSearchResponse>> {
    try {
      const res = await api.get<any>("/api/v1/mentors", filters);
      // If backend returns Page<MentorSummaryResponse>, res.content exists
      if (res && Array.isArray(res.content)) {
        return res.content;
      }
      return res;
    } catch (error) {
      // PHASE 0: Fallback to mock for mentors page only
      try {
        const mockResult = handleMockApiRequest(
          "/api/v1/mentors",
          "GET",
          undefined,
          filters
        );
        return mockResult as MentorSearchResponse[];
      } catch {
        throw error;
      }
    }
  },

  /**
   * Get detailed mentor profile
   * GET /api/v1/mentors/{mentorId}
   */
  async getMentorDetail(mentorId: string): Promise<MentorDetailResponse> {
    return api.get<MentorDetailResponse>(`/api/v1/mentors/${mentorId}`);
  },

  /**
   * Get mentor availability calendar slots
   * GET /api/v1/mentors/{mentorId}/availability?from={}&to={}
   */
  async getAvailability(
    mentorId: string,
    from: string,
    to: string
  ): Promise<AvailabilityResponse> {
    return api.get<AvailabilityResponse>(
      `/api/v1/mentors/${mentorId}/availability`,
      { from, to }
    );
  },

  /**
   * Get mentor public reviews
   * GET /api/v1/mentors/{mentorId}/reviews?page=0&size=10
   */
  async getMentorReviews(
    mentorId: string,
    pagination: PaginationParams = { page: 0, size: 10 }
  ): Promise<PageResponse<ReviewResponse>> {
    return api.get<PageResponse<ReviewResponse>>(
      `/api/v1/mentors/${mentorId}/reviews`,
      pagination
    );
  },

  // ==========================================
  // Authenticated User Mentor Offerings
  // ==========================================

  /**
   * List authenticated mentor's offerings
   * GET /api/v1/me/mentor-offerings
   */
  async getMyOfferings(): Promise<MentorOfferingResponse[]> {
    const res = await api.get<any>("/api/v1/me/mentor-offerings");
    if (res && Array.isArray(res.content)) {
      return res.content;
    }
    return Array.isArray(res) ? res : [];
  },

  /**
   * Create a new mentor offering
   * POST /api/v1/me/mentor-offerings
   */
  async createOffering(
    data: CreateMentorOfferingRequest
  ): Promise<MentorOfferingResponse> {
    return api.post<MentorOfferingResponse>("/api/v1/me/mentor-offerings", data);
  },

  /**
   * Update mentor offering
   * PATCH /api/v1/me/mentor-offerings/{id}
   */
  async updateOffering(
    id: string,
    data: UpdateMentorOfferingRequest
  ): Promise<MentorOfferingResponse> {
    try {
      return await api.patch<MentorOfferingResponse>(
        `/api/v1/me/mentor-offerings/${id}`,
        data
      );
    } catch {
      return api.put<MentorOfferingResponse>(
        `/api/v1/me/mentor-offerings/${id}`,
        data
      );
    }
  },

  /**
   * Delete mentor offering
   * DELETE /api/v1/me/mentor-offerings/{id}
   */
  async deleteOffering(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/me/mentor-offerings/${id}`);
  },
};
