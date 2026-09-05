import { api } from "@/lib/api-client";
import {
  AddUserSkillRequest,
  GlobalCatalogSkill,
  SkillCertificateResponse,
  SkillDirection,
  SkillLevel,
  UpdateUserSkillRequest,
  UserSkillResponse,
} from "@/types/api";

export const skillsService = {
  /**
   * Get user skills portfolio
   * GET /api/v1/me/skills?direction=TEACH
   */
  async getUserSkills(direction?: SkillDirection): Promise<UserSkillResponse[]> {
    return api.get<UserSkillResponse[]>("/api/v1/me/skills", { direction });
  },

  /**
   * Add a skill to authenticated user's portfolio
   * POST /api/v1/me/skills
   */
  async addUserSkill(data: AddUserSkillRequest): Promise<UserSkillResponse> {
    return api.post<UserSkillResponse>("/api/v1/me/skills", data);
  },

  async addCustomUserSkill(
    name: string,
    direction: SkillDirection,
    level: SkillLevel = "INTERMEDIATE",
  ): Promise<UserSkillResponse> {
    return api.post<UserSkillResponse>("/api/v1/me/skills/custom", {
      name,
      category: "Community",
      direction,
      level,
    });
  },

  async ensureTeachingSkill(
    name: string,
    level: SkillLevel = "INTERMEDIATE",
  ): Promise<UserSkillResponse> {
    const owned = await this.getUserSkills("TEACH");
    return (
      owned.find((item) => item.skill.name.toLowerCase() === name.trim().toLowerCase()) ||
      this.addCustomUserSkill(name.trim(), "TEACH", level)
    );
  },

  async ensureLearningSkill(
    name: string,
    level: SkillLevel = "INTERMEDIATE",
  ): Promise<UserSkillResponse> {
    const owned = await this.getUserSkills("LEARN");
    return (
      owned.find((item) => item.skill.name.toLowerCase() === name.trim().toLowerCase()) ||
      this.addCustomUserSkill(name.trim(), "LEARN", level)
    );
  },

  /**
   * Update skill proficiency level
   * PATCH /api/v1/me/skills/{id}
   */
  async updateUserSkill(id: string, data: UpdateUserSkillRequest): Promise<UserSkillResponse> {
    try {
      return await api.patch<UserSkillResponse>(`/api/v1/me/skills/${id}`, data);
    } catch {
      return api.put<UserSkillResponse>(`/api/v1/me/skills/${id}`, data);
    }
  },

  /**
   * Delete skill from user portfolio
   * DELETE /api/v1/me/skills/{id}
   */
  async deleteUserSkill(id: string): Promise<void> {
    return api.delete<void>(`/api/v1/me/skills/${id}`);
  },

  /**
   * Upload Skill Certificate (PDF / Image)
   * POST /api/v1/me/skills/{skillId}/certificate
   */
  async uploadCertificate(skillId: string, file: File): Promise<SkillCertificateResponse> {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<SkillCertificateResponse>(
      `/api/v1/me/skills/${skillId}/certificate`,
      formData,
    );
  },

  /**
   * Get authenticated user's uploaded certificates
   * GET /api/v1/me/certificates
   */
  async getMyCertificates(): Promise<SkillCertificateResponse[]> {
    return api.get<SkillCertificateResponse[]>("/api/v1/me/certificates");
  },

  /**
   * Download Skill Certificate binary stream
   * GET /api/v1/users/{userId}/skills/{skillId}/certificate
   */
  async downloadCertificate(userId: string, skillId: string): Promise<Blob> {
    return api.download(`/api/v1/users/${userId}/skills/${skillId}/certificate`);
  },

  /**
   * Delete Skill Certificate
   * DELETE /api/v1/me/skills/{skillId}/certificate
   */
  async deleteCertificate(skillId: string): Promise<void> {
    return api.delete<void>(`/api/v1/me/skills/${skillId}/certificate`);
  },

  // ==========================================
  // Global Skills Catalog
  // ==========================================

  /**
   * List all global skills in the catalog
   * GET /api/skills or GET /api/v1/skills
   */
  async getCatalog(): Promise<GlobalCatalogSkill[]> {
    try {
      return await api.get<GlobalCatalogSkill[]>("/api/skills");
    } catch {
      return api.get<GlobalCatalogSkill[]>("/api/v1/skills");
    }
  },

  /**
   * Search catalog skills by query keyword
   * GET /api/skills/search?q={query}
   */
  async searchCatalog(query: string): Promise<GlobalCatalogSkill[]> {
    try {
      return await api.get<GlobalCatalogSkill[]>("/api/skills/search", { q: query });
    } catch {
      return api.get<GlobalCatalogSkill[]>("/api/v1/skills/search", { q: query });
    }
  },

  /**
   * Get list of distinct skill categories
   * GET /api/v1/skills/categories
   */
  async getCategories(): Promise<string[] | { category: string }[]> {
    return api.get<string[] | { category: string }[]>("/api/v1/skills/categories");
  },

  /**
   * Get single skill details by ID
   * GET /api/skills/{id}
   */
  async getSkillById(id: string): Promise<GlobalCatalogSkill> {
    try {
      return await api.get<GlobalCatalogSkill>(`/api/skills/${id}`);
    } catch {
      return api.get<GlobalCatalogSkill>(`/api/v1/skills/${id}`);
    }
  },

  /**
   * Create a new catalog skill
   * POST /api/skills
   */
  async createSkill(data: {
    name: string;
    category: string;
    description?: string;
  }): Promise<GlobalCatalogSkill> {
    return api.post<GlobalCatalogSkill>("/api/skills", data);
  },
};
