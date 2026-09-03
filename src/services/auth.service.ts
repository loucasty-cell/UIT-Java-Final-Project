import { api } from "@/lib/api-client";
import {
  AuthResponse,
  LoginRequest,
  PublicUserProfileResponse,
  PublicUserSkillResponse,
  RefreshTokenRequest,
  RegisterRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/types/api";

export interface DashboardResponse {
  userId: string;
  displayName: string;
  email: string;
  major?: string;
  yearOfStudy?: number;
  availablePoints: number;
  heldPoints: number;
  totalEarned: number;
  totalSpent: number;
  completedSessionsCount: number;
  activeSessionsCount: number;
}

export const authService = {
  /**
   * Register a new student account
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/api/v1/auth/register", data);
  },

  /**
   * Login with email and password
   * POST /api/v1/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/api/v1/auth/login", { ...data, email: data.email.trim() });
  },

  /**
   * Refresh JWT access token
   * POST /api/v1/auth/refresh
   */
  async refresh(data: RefreshTokenRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>("/api/v1/auth/refresh", data);
  },

  /**
   * Logout user and revoke token family
   * POST /api/v1/auth/logout
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken)
      await api.post<void>("/api/v1/auth/logout", { refreshToken }, { timeoutMs: 5000 });
  },

  /**
   * Get authenticated user profile
   * GET /api/v1/me
   */
  async getProfile(): Promise<UserProfileResponse> {
    return api.get<UserProfileResponse>("/api/v1/me");
  },

  /**
   * Update authenticated user profile
   * PATCH /api/v1/me or PUT /api/v1/me/profile
   */
  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    try {
      return await api.patch<UserProfileResponse>("/api/v1/me", data);
    } catch {
      return api.put<UserProfileResponse>("/api/v1/me/profile", data);
    }
  },

  /**
   * Get authenticated user aggregated dashboard projection
   * GET /api/v1/me/dashboard
   */
  async getDashboard(): Promise<DashboardResponse> {
    return api.get<DashboardResponse>("/api/v1/me/dashboard");
  },

  /**
   * Get public user profile
   * GET /api/v1/users/{userId}/profile
   */
  async getPublicProfile(userId: string): Promise<PublicUserProfileResponse> {
    return api.get<PublicUserProfileResponse>(`/api/v1/users/${userId}/profile`);
  },

  /**
   * Get public user's skills
   * GET /api/v1/users/{userId}/skills
   */
  async getPublicSkills(userId: string): Promise<PublicUserSkillResponse[]> {
    return api.get<PublicUserSkillResponse[]>(`/api/v1/users/${userId}/skills`);
  },
};
