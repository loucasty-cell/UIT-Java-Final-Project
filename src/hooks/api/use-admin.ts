import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api-client";
import { adminService } from "@/services/admin.service";
import {
  AdminPlatformSettingsResponse,
  PaginationParams,
  ResolveDisputeRequest,
} from "@/types/api";
import { queryKeys } from "./query-keys";

export function useAdminMetricsQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.admin.metrics,
    queryFn: () => adminService.getDashboardMetrics(),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useAdminUsersQuery(params?: PaginationParams) {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.getUsers(params),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

export function useFreezeUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.freezeUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnfreezeUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.unfreezeUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useBanUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.banUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdjustUserPointsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta, reason }: { id: string; delta: number; reason: string }) =>
      adminService.adjustUserPoints(id, delta, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      adminService.updateUserRole(id, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminReportsQuery(params?: PaginationParams) {
  const token = getAccessToken();
  return useQuery({
    queryKey: ["admin", "reports", params] as const,
    queryFn: () => adminService.getReports(undefined, undefined, params),
    enabled: !!token,
  });
}

export function useDismissReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.dismissReport(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });
}

export function useRemoveReportedContentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminService.removeReportedContent(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] }),
  });
}

export function useAdminDisputesQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.admin.disputes,
    queryFn: () => adminService.getDisputes(),
    enabled: !!token,
  });
}

export function useResolveDisputeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveDisputeRequest }) =>
      adminService.resolveDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.disputes });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useAdminSettingsQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: () => adminService.getSettings(),
    enabled: !!token,
  });
}

export function useUpdateAdminSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminPlatformSettingsResponse) => adminService.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.admin.settings, updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
    },
  });
}

export function useAdminAuditLogsQuery(params?: PaginationParams) {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params),
    enabled: !!token,
  });
}
