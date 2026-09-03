import { api } from "@/lib/api-client";
import { DisputeSessionRequest, SessionResponse, UpdateSessionRequest } from "@/types/api";

export const sessionsService = {
  /**
   * List active/all user sessions
   * GET /api/sessions/me, /api/v1/sessions/me, /api/sessions/active/me, or /api/sessions
   */
  async listSessions(status?: string): Promise<SessionResponse[]> {
    const params = status ? { status } : undefined;
    try {
      if (!status || status === "ALL") {
        return await api.get<SessionResponse[]>("/api/sessions/me");
      }
      return await api.get<SessionResponse[]>("/api/sessions/me", params);
    } catch {
      try {
        return await api.get<SessionResponse[]>("/api/sessions/active/me");
      } catch {
        return api.get<SessionResponse[]>("/api/sessions", params);
      }
    }
  },

  /**
   * Get calendar sessions in date interval
   * GET /api/sessions/calendar/me
   */
  async getCalendarSessions(start?: string, end?: string): Promise<SessionResponse[]> {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;
    try {
      return await api.get<SessionResponse[]>("/api/sessions/calendar/me", params);
    } catch {
      return this.listSessions();
    }
  },

  /**
   * Get single session details
   * GET /api/v1/sessions/{id}
   */
  async getSessionDetail(id: string): Promise<SessionResponse> {
    try {
      return await api.get<SessionResponse>(`/api/v1/sessions/${id}`);
    } catch {
      return api.get<SessionResponse>(`/api/sessions/${id}`);
    }
  },

  /**
   * Start a scheduled session
   * POST /api/v1/sessions/{id}/start
   */
  async startSession(id: string): Promise<SessionResponse> {
    try {
      return await api.post<SessionResponse>(`/api/v1/sessions/${id}/start`);
    } catch {
      return api.post<SessionResponse>(`/api/sessions/${id}/start`);
    }
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
    data?: { rating?: number; review?: string },
  ): Promise<
    SessionResponse & {
      pointsReleased?: boolean;
      autoReleaseAt?: string;
      confirmedByMe?: boolean;
      confirmedByOtherParticipant?: boolean;
    }
  > {
    const payload =
      data && (data.rating || data.review)
        ? { rating: data.rating, review: data.review }
        : undefined;
    try {
      return await api.post<SessionResponse>(
        `/api/v1/sessions/${id}/completion-confirmations`,
        payload,
      );
    } catch {
      // Fallback to legacy dev endpoint (no body)
      return api.post<SessionResponse>(`/api/sessions/${id}/complete`);
    }
  },

  /**
   * Update session notes or meeting URL
   * PATCH /api/sessions/{id}
   */
  async updateSession(id: string, data: UpdateSessionRequest): Promise<SessionResponse> {
    return api.patch<SessionResponse>(`/api/sessions/${id}`, data);
  },

  /**
   * Dispute an ongoing session (freezes escrow points pending admin review)
   * POST /api/sessions/{id}/dispute
   */
  async disputeSession(id: string, data: DisputeSessionRequest): Promise<unknown> {
    return api.post(`/api/sessions/${id}/dispute`, data);
  },
};
