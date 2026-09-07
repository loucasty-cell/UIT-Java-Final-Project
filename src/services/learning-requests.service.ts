/**
 * Learning Requests Service
 * Handles the complete booking lifecycle: create → accept/reject/cancel.
 * This is the CRITICAL missing piece that connects /mentors booking to /sessions.
 */
import { apiClient } from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";

// ─── Types ───────────────────────────────────────────────────────────────────

export type LearningRequestMode = "POINTS" | "SKILL_SWAP" | "VOLUNTEER";
export type LearningRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
export type LearningRequestDirection = "INCOMING" | "OUTGOING";

export interface CreateLearningRequestDTO {
  mentorId: string;
  mentorOfferingId?: string;
  requestedSkillId: string;
  mode: LearningRequestMode;
  /** Only required for SKILL_SWAP mode */
  offeredUserSkillId?: string;
  scheduledStart: string; // ISO-8601 UTC
  durationMinutes: number;
  message?: string;
  /** Optional: link from a forum post */
  sourceForumPostId?: string;
}

export interface LearningRequestResponse {
  id: string;
  learnerId: string;
  learnerName?: string;
  mentorId: string;
  mentorName?: string;
  mentorOfferingId: string;
  requestedSkillId: string;
  requestedSkill?: { id: string; name: string; category: string };
  requestedSkillName?: string;
  mode: LearningRequestMode;
  offeredUserSkillId?: string;
  offeredSkillName?: string;
  scheduledStart: string;
  durationMinutes: number;
  message?: string;
  status: LearningRequestStatus;
  pointCostSnapshot?: number;
  sessionId?: string;
  meetingUrl?: string;
  learningNeedOfferId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcceptRequestDTO {
  meetingUrl?: string;
}

export interface RejectRequestDTO {
  reason?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const learningRequestsService = {
  /**
   * Create a new learning request (book a session).
   * For POINTS mode: backend will hold escrow from learner's wallet.
   * For SKILL_SWAP mode: backend validates reciprocal skill match.
   * For VOLUNTEER mode: no points involved.
   */
  createRequest: async (data: CreateLearningRequestDTO): Promise<LearningRequestResponse> => {
    const idempotencyKey = crypto.randomUUID();
    return apiClient<LearningRequestResponse>("/api/v1/learning-requests", {
      method: "POST",
      body: JSON.stringify(data),
      idempotencyKey,
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  /**
   * List learning requests.
   * @param direction - INCOMING (I'm the mentor) or OUTGOING (I'm the learner)
   * @param status - Filter by status
   */
  listRequests: async (
    direction?: LearningRequestDirection,
    status?: LearningRequestStatus,
    params?: PaginationParams,
  ): Promise<LearningRequestResponse[]> => {
    const searchParams = new URLSearchParams();
    if (direction) searchParams.set("direction", direction);
    if (status) searchParams.set("status", status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.size) searchParams.set("size", String(params.size));

    const query = searchParams.toString();
    const result = await apiClient<
      LearningRequestResponse[] | { content: LearningRequestResponse[] }
    >(`/api/v1/learning-requests${query ? `?${query}` : ""}`);
    return Array.isArray(result) ? result : result.content || [];
  },

  /**
   * Get a single learning request by ID.
   */
  getRequest: async (id: string): Promise<LearningRequestResponse> => {
    return apiClient<LearningRequestResponse>(`/api/v1/learning-requests/${id}`);
  },

  /**
   * Mentor accepts a learning request.
   * Backend will: update status, create session record, notify learner.
   */
  acceptRequest: async (id: string, data?: AcceptRequestDTO): Promise<LearningRequestResponse> => {
    return apiClient<LearningRequestResponse>(`/api/v1/learning-requests/${id}/accept`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Mentor rejects a learning request.
   * Backend will: refund escrow (if POINTS), notify learner.
   */
  rejectRequest: async (id: string, data?: RejectRequestDTO): Promise<LearningRequestResponse> => {
    return apiClient<LearningRequestResponse>(`/api/v1/learning-requests/${id}/reject`, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * Learner cancels their own pending request.
   * Backend will: refund escrow (if POINTS), notify mentor.
   */
  cancelRequest: async (id: string): Promise<LearningRequestResponse> => {
    return apiClient<LearningRequestResponse>(`/api/v1/learning-requests/${id}/cancel`, {
      method: "POST",
    });
  },
};
