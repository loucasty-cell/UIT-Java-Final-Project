import { api } from "@/lib/api-client";
import { CreateReviewRequest, ReviewResponse } from "@/types/api";

export const reviewsService = {
  /**
   * Submit a review for a completed session
   * POST /api/reviews/sessions/{sessionId}
   */
  async submitReview(sessionId: string, data: CreateReviewRequest): Promise<ReviewResponse> {
    return api.post<ReviewResponse>(`/api/reviews/sessions/${sessionId}`, data);
  },

  /**
   * Get all reviews left for a specific session
   * GET /api/reviews/sessions/{sessionId}
   */
  async getSessionReviews(sessionId: string): Promise<ReviewResponse[]> {
    return api.get<ReviewResponse[]>(`/api/reviews/sessions/${sessionId}`);
  },
};
