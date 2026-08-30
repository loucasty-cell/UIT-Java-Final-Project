import { api } from "@/lib/api-client";
import {
  CounterSwapProposalRequest,
  CreateSwapProposalRequest,
  RejectSwapProposalRequest,
  SwapProposalResponse,
} from "@/types/api";

export const swapsService = {
  /**
   * Create a new skill swap proposal
   * POST /api/swaps/proposals or /api/requests/swaps
   */
  async createProposal(
    data: CreateSwapProposalRequest
  ): Promise<SwapProposalResponse> {
    try {
      return await api.post<SwapProposalResponse>("/api/swaps/proposals", data);
    } catch {
      return api.post<SwapProposalResponse>("/api/requests/swaps", data);
    }
  },

  /**
   * Accept an incoming swap proposal (creates session and holds escrow)
   * POST /api/swaps/proposals/{id}/accept
   */
  async acceptProposal(id: string): Promise<SwapProposalResponse> {
    try {
      return await api.post<SwapProposalResponse>(`/api/swaps/proposals/${id}/accept`);
    } catch {
      return api.post<SwapProposalResponse>(`/api/requests/swaps/${id}/accept`);
    }
  },

  /**
   * Reject a swap proposal (refunds held points)
   * POST /api/swaps/proposals/{id}/reject
   */
  async rejectProposal(
    id: string,
    data?: RejectSwapProposalRequest
  ): Promise<SwapProposalResponse> {
    try {
      return await api.post<SwapProposalResponse>(
        `/api/swaps/proposals/${id}/reject`,
        data || {}
      );
    } catch {
      return api.post<SwapProposalResponse>(
        `/api/requests/swaps/${id}/reject`,
        data || {}
      );
    }
  },

  /**
   * Counter a swap proposal with adjusted terms/cost
   * POST /api/swaps/proposals/{id}/counter
   */
  async counterProposal(
    id: string,
    data: CounterSwapProposalRequest
  ): Promise<SwapProposalResponse> {
    return api.post<SwapProposalResponse>(`/api/swaps/proposals/${id}/counter`, data);
  },

  /**
   * Cancel an outgoing pending swap proposal
   * POST /api/requests/swaps/{id}/cancel or /api/swaps/proposals/{id}/cancel
   */
  async cancelProposal(id: string): Promise<SwapProposalResponse> {
    try {
      return await api.post<SwapProposalResponse>(`/api/requests/swaps/${id}/cancel`);
    } catch {
      return api.post<SwapProposalResponse>(`/api/swaps/proposals/${id}/cancel`);
    }
  },

  /**
   * Get user's proposal history
   * GET /api/swaps/history/me or /api/requests/swaps/history/me
   */
  async getSwapHistory(): Promise<SwapProposalResponse[]> {
    try {
      return await api.get<SwapProposalResponse[]>("/api/swaps/history/me");
    } catch {
      return api.get<SwapProposalResponse[]>("/api/requests/swaps/history/me");
    }
  },

  /**
   * Get incoming pending proposals for current user
   * GET /api/requests/swaps/pending/incoming
   */
  async getPendingIncoming(): Promise<SwapProposalResponse[]> {
    return api.get<SwapProposalResponse[]>("/api/requests/swaps/pending/incoming");
  },

  /**
   * Mark a swap session completed
   * POST /api/swaps/sessions/{sessionId}/complete
   */
  async completeSwapSession(sessionId: string): Promise<any> {
    return api.post(`/api/swaps/sessions/${sessionId}/complete`);
  },
};
