import { api } from "@/lib/api-client";
import {
  DisputeSessionRequest,
  SessionResponse,
  UpdateSessionRequest,
} from "@/types/api";

export const sessionsService = {
  /**
   * List active/all user sessions
   * GET /api/sessions/active/me or /api/sessions
   */
  async listSessions(status?: string): Promise<SessionResponse[]> {
    try {
      return await api.get<SessionResponse[]>("/api/sessions/active/me");
    } catch {
      return api.get<SessionResponse[]>("/api/sessions", { status });
    }
  },

  /**
   * Get single session details
   * GET /api/sessions/{id}
   */
  async getSessionDetail(id: string): Promise<SessionResponse> {
    return api.get<SessionResponse>(`/api/sessions/${id}`);
  },

  /**
   * Start a scheduled session
   * POST /api/sessions/{id}/start
   */
  async startSession(id: string): Promise<SessionResponse> {
    return api.post<SessionResponse>(`/api/sessions/${id}/start`);
  },

  /**
   * Complete session via double-confirmation per api.md:239
   * POST /api/v1/sessions/{id}/completion-confirmations {rating,review?}
   * 1st confirmation → status AWAITING_CONFIRMATION + autoReleaseAt + pointsReleased:false
   * 2nd confirmation → status COMPLETED + pointsReleased:true (or auto 18h)
   * Falls back to legacy POST /api/sessions/{id}/complete for dev branch compat.
   */
  async completeSession(
    id: string,
    data?: { rating?: number; review?: string }
  ): Promise<
    SessionResponse & {
      pointsReleased?: boolean;
      autoReleaseAt?: string;
      confirmedByMe?: boolean;
      confirmedByOtherParticipant?: boolean;
    }
  > {
    const payload = data && (data.rating || data.review) ? { rating: data.rating, review: data.review } : undefined;
    try {
      return await api.post<any>(`/api/v1/sessions/${id}/completion-confirmations`, payload);
    } catch {
      // Fallback to legacy dev endpoint (no body)
      return api.post<SessionResponse>(`/api/sessions/${id}/complete`);
    }
  },

  /**
   * Update session notes or meeting URL
   * PATCH /api/sessions/{id}
   */
  async updateSession(
    id: string,
    data: UpdateSessionRequest
  ): Promise<SessionResponse> {
    return api.patch<SessionResponse>(`/api/sessions/${id}`, data);
  },

  /**
   * Dispute an ongoing session (freezes escrow points pending admin review)
   * POST /api/sessions/{id}/dispute
   */
  async disputeSession(
    id: string,
    data: DisputeSessionRequest
  ): Promise<any> {
    return api.post(`/api/sessions/${id}/dispute`, data);
  },
};
