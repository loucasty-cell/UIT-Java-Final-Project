import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import { LoginRequest, RegisterRequest, UpdateUserProfileRequest } from "@/types/api";
import { queryKeys } from "./query-keys";

export function useProfileQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authService.getProfile(),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function usePublicProfileQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.auth.publicProfile(userId),
    queryFn: () => authService.getPublicProfile(userId),
    enabled: !!userId,
  });
}

export function usePublicSkillsQuery(userId: string) {
  return useQuery({
    queryKey: queryKeys.auth.publicSkills(userId),
    queryFn: () => authService.getPublicSkills(userId),
    enabled: !!userId,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (refreshToken?: string) => authService.logout(refreshToken),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => authService.updateProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.auth.profile, updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
}
