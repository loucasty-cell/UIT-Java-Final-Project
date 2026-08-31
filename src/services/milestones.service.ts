import { api } from "@/lib/api-client";

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon?: string;
  rewardPoints: number;
  targetCount: number;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserMilestoneProgressResponse {
  milestoneId: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  targetCount: number;
  currentCount: number;
  rewardPoints: number;
  completed: boolean;
  completedAt?: string;
}

export interface CreateMilestoneRequest {
  name: string;
  description: string;
  icon?: string;
  rewardPoints: number;
  targetCount: number;
  category: string;
}

export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  icon?: string;
  rewardPoints?: number;
  targetCount?: number;
  category?: string;
  active?: boolean;
}

export const milestonesService = {
  /**
   * Get current authenticated user's milestone progress
   * GET /api/v1/me/milestones
   */
  async getMyMilestones(): Promise<UserMilestoneProgressResponse[]> {
    return api.get<UserMilestoneProgressResponse[]>("/api/v1/me/milestones");
  },

  /**
   * Admin: List all platform milestones
   * GET /api/v1/admin/milestones
   */
  async getAllMilestones(): Promise<Milestone[]> {
    return api.get<Milestone[]>("/api/v1/admin/milestones");
  },

  /**
   * Admin: Create a new milestone
   * POST /api/v1/admin/milestones
   */
  async createMilestone(data: CreateMilestoneRequest): Promise<Milestone> {
    return api.post<Milestone>("/api/v1/admin/milestones", data);
  },

  /**
   * Admin: Update an existing milestone
   * PATCH /api/v1/admin/milestones/{id}
   */
  async updateMilestone(id: string, data: UpdateMilestoneRequest): Promise<Milestone> {
    return api.patch<Milestone>(`/api/v1/admin/milestones/${id}`, data);
  },
};
