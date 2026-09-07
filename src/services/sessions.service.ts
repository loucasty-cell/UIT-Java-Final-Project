import { api } from "@/lib/api-client";
import type { DisputeSessionRequest, SessionResponse, UpdateSessionRequest } from "@/types/api";

export interface CompletionResponse {
  id: string;
  status: SessionResponse["status"];
  pointsReleased: number;
  autoReleaseAt?: string;
  confirmedByMe: boolean;
  confirmedByOther: boolean;
}

export const sessionsService = {
  listSessions: (status?: string) =>
    api.get<SessionResponse[]>(
      "/api/v1/sessions/me",
      status && status !== "ALL" ? { status } : undefined,
    ),
  getCalendarSessions: (start?: string, end?: string) =>
    api.get<SessionResponse[]>("/api/v1/sessions/calendar/me", { start, end }),
  getSessionDetail: (id: string) => api.get<SessionResponse>(`/api/v1/sessions/${id}`),
  startSession: (id: string) => api.post<SessionResponse>(`/api/v1/sessions/${id}/start`),
  completeSession: (id: string) =>
    api.post<CompletionResponse>(`/api/v1/sessions/${id}/completion-confirmations`),
  updateSession: (id: string, data: UpdateSessionRequest) =>
    api.patch<SessionResponse>(`/api/v1/sessions/${id}`, data),
  disputeSession: (id: string, data: DisputeSessionRequest) =>
    api.post(`/api/v1/sessions/${id}/dispute`, data),
};
