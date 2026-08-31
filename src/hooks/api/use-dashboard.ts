import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "./query-keys";
import type { DashboardResponse } from "@/types/api";

export const dashboardService = {
  getDashboard: async (): Promise<DashboardResponse> => {
    return apiClient<DashboardResponse>("/api/v1/me/dashboard");
  },
};

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.me,
    queryFn: () => dashboardService.getDashboard(),
  });
}
