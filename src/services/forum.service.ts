import { api } from "@/lib/api-client";
import {
  CreateForumCommentRequest,
  CreateForumPostRequest,
  ForumCommentResponse,
  ForumPostLikeResponse,
  ForumPostResponse,
  ForumPostSummaryResponse,
  PageResponse,
  PaginationParams,
  RewardCommentRequest,
  RewardCommentResponse,
} from "@/types/api";

export interface TopVolunteerResponse {
  userId: string;
  displayName: string;
  pointsEarned: number;
  sessionsHosted: number;
  helpfulCommentsCount: number;
  rank: number;
}

export const forumService = {
  /**
   * List forum posts with optional skill filter, keyword search, or pagination
   * GET /api/v1/forum/posts
   */
  async getPosts(
    skillId?: string,
    search?: string,
    params?: PaginationParams
  ): Promise<ForumPostSummaryResponse[]> {
    const res = await api.get<any>("/api/v1/forum/posts", {
      skillId,
      search,
      ...params,
    });
    if (res && Array.isArray(res.content)) {
      return res.content;
    }
    return Array.isArray(res) ? res : [];
  },

  /**
   * Get full forum post with comments
   * GET /api/v1/forum/posts/{postId}
   */
  async getPost(postId: string): Promise<ForumPostResponse> {
    return api.get<ForumPostResponse>(`/api/v1/forum/posts/${postId}`);
  },

  /**
   * Create a new forum post
   * POST /api/v1/forum/posts
   */
  async createPost(data: CreateForumPostRequest): Promise<ForumPostResponse> {
    return api.post<ForumPostResponse>("/api/v1/forum/posts", data);
  },

  /**
   * Update an existing forum post
   * PATCH /api/v1/forum/posts/{postId}
   */
  async updatePost(
    postId: string,
    data: Partial<CreateForumPostRequest>
  ): Promise<ForumPostResponse> {
    return api.patch<ForumPostResponse>(`/api/v1/forum/posts/${postId}`, data);
  },

  /**
   * Delete a forum post
   * DELETE /api/v1/forum/posts/{postId}
   */
  async deletePost(postId: string): Promise<void> {
    return api.delete<void>(`/api/v1/forum/posts/${postId}`);
  },

  /**
   * Like a forum post
   * PUT /api/v1/forum/posts/{postId}/like or POST
   */
  async likePost(postId: string): Promise<ForumPostLikeResponse> {
    try {
      return await api.put<ForumPostLikeResponse>(`/api/v1/forum/posts/${postId}/like`);
    } catch {
      return api.post<ForumPostLikeResponse>(`/api/v1/forum/posts/${postId}/like`);
    }
  },

  /**
   * Unlike a forum post
   * DELETE /api/v1/forum/posts/{postId}/like
   */
  async unlikePost(postId: string): Promise<ForumPostLikeResponse> {
    return api.delete<ForumPostLikeResponse>(`/api/v1/forum/posts/${postId}/like`);
  },

  /**
   * Get comments for a post
   * GET /api/v1/forum/posts/{postId}/comments
   */
  async getComments(
    postId: string,
    params?: PaginationParams
  ): Promise<PageResponse<ForumCommentResponse> | ForumCommentResponse[]> {
    return api.get<PageResponse<ForumCommentResponse>>(
      `/api/v1/forum/posts/${postId}/comments`,
      params
    );
  },

  /**
   * Add a comment to a forum post
   * POST /api/v1/forum/posts/{postId}/comments
   */
  async addComment(
    postId: string,
    data: CreateForumCommentRequest
  ): Promise<ForumCommentResponse> {
    return api.post<ForumCommentResponse>(
      `/api/v1/forum/posts/${postId}/comments`,
      data
    );
  },

  /**
   * Delete a comment
   * DELETE /api/v1/forum/comments/{commentId}
   */
  async deleteComment(commentId: string): Promise<void> {
    return api.delete<void>(`/api/v1/forum/comments/${commentId}`);
  },

  /**
   * Reward a comment / Mark helpful
   * POST /api/v1/forum/comments/{commentId}/mark-helpful or /posts/{postId}/reward
   */
  async rewardComment(
    postId: string,
    data: RewardCommentRequest
  ): Promise<RewardCommentResponse> {
    try {
      await api.post<void>(`/api/v1/forum/comments/${data.commentId}/mark-helpful`);
      return { success: true, pointsAwarded: data.points };
    } catch {
      return api.post<RewardCommentResponse>(
        `/api/v1/forum/posts/${postId}/reward`,
        data
      );
    }
  },

  /**
   * Get top volunteer leaderboard
   * GET /api/v1/forum/top-volunteers?week={date}
   */
  async getTopVolunteers(
    week?: string,
    params?: PaginationParams
  ): Promise<PageResponse<TopVolunteerResponse>> {
    const defaultWeek = week || new Date().toISOString().split("T")[0];
    return api.get<PageResponse<TopVolunteerResponse>>(
      "/api/v1/forum/top-volunteers",
      { week: defaultWeek, ...params }
    );
  },
};
