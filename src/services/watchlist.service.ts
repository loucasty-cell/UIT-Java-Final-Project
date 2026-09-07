import { api } from "@/lib/api-client";

export interface WatchlistResponse {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category: string;
  createdAt: string;
}

export interface AddWatchlistRequest {
  skillId: string;
}

export const watchlistService = {
  /**
   * Get all watchlisted skills for current user
   * GET /api/v1/me/watchlist
   */
  async getMyWatchlist(): Promise<WatchlistResponse[]> {
    return api.get<WatchlistResponse[]>("/api/v1/me/watchlist");
  },

  /**
   * Add a skill to user's watchlist
   * POST /api/v1/me/watchlist
   */
  async addToWatchlist(skillId: string): Promise<WatchlistResponse> {
    return api.post<WatchlistResponse>("/api/v1/me/watchlist", { skillId });
  },

  /**
   * Remove a skill from user's watchlist
   * DELETE /api/v1/me/watchlist/{id}
   */
  async removeFromWatchlist(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/me/watchlist/${id}`);
  },
};
