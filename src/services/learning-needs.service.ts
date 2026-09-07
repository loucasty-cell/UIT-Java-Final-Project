import { api } from "@/lib/api-client";
import type { CreateLearningNeedRequest, LearningNeedResponse } from "@/types/api";

export const learningNeedsService = {
  list(): Promise<LearningNeedResponse[]> {
    return api.get<LearningNeedResponse[]>("/api/v1/learning-needs");
  },

  create(data: CreateLearningNeedRequest): Promise<LearningNeedResponse> {
    return api.post<LearningNeedResponse>("/api/v1/learning-needs", data);
  },

  offerToTeach(
    needId: string,
    data: { message?: string; proposedStart: string; mode: "POINTS" | "SKILL_SWAP" | "VOLUNTEER" },
  ): Promise<LearningNeedResponse> {
    return api.post<LearningNeedResponse>(`/api/v1/learning-needs/${needId}/offers`, {
      message: data.message?.trim() || undefined,
      proposedStart: data.proposedStart,
      mode: data.mode,
    });
  },

  remove(needId: string): Promise<void> {
    return api.delete<void>(`/api/v1/learning-needs/${needId}`);
  },
};
