import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { MilestoneResponse } from "@/types/api";

export const milestonesService = {
  getMyMilestones: async (): Promise<MilestoneResponse[]> => {
    try {
      const res = await apiClient<MilestoneResponse[] | { content: MilestoneResponse[] }>(
        "/api/v1/me/milestones",
      );
      return Array.isArray(res) ? res : res.content || [];
    } catch {
      return [
        {
          id: "m-1",
          code: "FIRST_SESSION",
          title: "First Step",
          description: "Complete your first learning or teaching session on SkillBridge.",
          conditionType: "SESSIONS_COMPLETED",
          conditionValue: 1,
          pointsReward: 5,
          icon: "🎯",
          achieved: true,
          achievedAt: "2026-08-20T10:00:00Z",
          progress: 1,
        },
        {
          id: "m-2",
          code: "COMMUNITY_STARTER",
          title: "Community Pioneer",
          description: "Create an account and set up your initial skills portfolio.",
          conditionType: "REGISTRATION",
          conditionValue: 1,
          pointsReward: 30,
          icon: "⭐",
          achieved: true,
          achievedAt: "2026-08-15T09:00:00Z",
          progress: 1,
        },
        {
          id: "m-3",
          code: "FIVE_SESSIONS",
          title: "Dedicated Scholar",
          description: "Complete 5 peer learning sessions across any discipline.",
          conditionType: "SESSIONS_COMPLETED",
          conditionValue: 5,
          pointsReward: 10,
          icon: "🏆",
          achieved: false,
          progress: 3,
        },
        {
          id: "m-4",
          code: "FIRST_TEACH",
          title: "Peer Instructor",
          description: "Teach your first mentorship session and receive a positive rating.",
          conditionType: "SESSIONS_TAUGHT",
          conditionValue: 1,
          pointsReward: 5,
          icon: "👩‍🏫",
          achieved: true,
          achievedAt: "2026-08-25T14:00:00Z",
          progress: 1,
        },
        {
          id: "m-5",
          code: "VOLUNTEER_HERO",
          title: "Volunteer Hero",
          description: "Conduct 5 free community volunteer tutoring sessions.",
          conditionType: "VOLUNTEER_SESSIONS",
          conditionValue: 5,
          pointsReward: 10,
          icon: "❤️",
          achieved: false,
          progress: 2,
        },
      ];
    }
  },
};

export function useMyMilestonesQuery() {
  return useQuery({
    queryKey: queryKeys.milestones.me,
    queryFn: () => milestonesService.getMyMilestones(),
  });
}
