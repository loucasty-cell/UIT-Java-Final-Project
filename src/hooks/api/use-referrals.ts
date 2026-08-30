import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { ReferralCodeResponse, ReferralItemResponse } from "@/types/api";

export const referralsService = {
  getReferralCode: async (): Promise<ReferralCodeResponse> => {
    try {
      return await apiClient<ReferralCodeResponse>("/api/v1/me/referral-code");
    } catch {
      return {
        referralCode: "REF-LEARN5",
        referralUrl: "https://skillbridge.app/login?ref=REF-LEARN5",
        totalReferrals: 3,
        totalPointsEarned: 15,
      };
    }
  },

  getMyReferrals: async (): Promise<ReferralItemResponse[]> => {
    try {
      const res = await apiClient<ReferralItemResponse[] | { content: ReferralItemResponse[] }>(
        "/api/v1/me/referrals",
      );
      return Array.isArray(res) ? res : res.content || [];
    } catch {
      return [
        {
          id: "ref-1",
          referredUserId: "u-marcus",
          referredUserName: "Marcus Delgado",
          referredUserEmail: "marcus@university.edu",
          pointsAwarded: 5,
          createdAt: "2026-08-25T10:00:00Z",
        },
        {
          id: "ref-2",
          referredUserId: "u-lena",
          referredUserName: "Lena Karlsson",
          referredUserEmail: "lena@university.edu",
          pointsAwarded: 5,
          createdAt: "2026-08-20T14:00:00Z",
        },
      ];
    }
  },
};

export function useReferralCodeQuery() {
  return useQuery({
    queryKey: queryKeys.referrals.code,
    queryFn: () => referralsService.getReferralCode(),
  });
}

export function useMyReferralsQuery() {
  return useQuery({
    queryKey: queryKeys.referrals.list,
    queryFn: () => referralsService.getMyReferrals(),
  });
}
