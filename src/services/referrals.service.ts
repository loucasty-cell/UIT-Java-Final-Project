import { apiClient } from "@/lib/api-client";
import type { ReferralCodeResponse, ReferralItemResponse } from "@/types/api";

export const referralsService = {
  getCode: async (): Promise<ReferralCodeResponse> => {
    return apiClient<ReferralCodeResponse>("/api/v1/me/referral-code");
  },
  getReferrals: async (): Promise<ReferralItemResponse[]> => {
    const res = await apiClient<ReferralItemResponse[] | { content: ReferralItemResponse[] }>(
      "/api/v1/me/referrals",
    );
    return Array.isArray(res) ? res : res.content || [];
  },
};
