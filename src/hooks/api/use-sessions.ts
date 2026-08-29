import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsService } from "@/services/sessions.service";
import { DisputeSessionRequest, UpdateSessionRequest } from "@/types/api";
import { queryKeys } from "./query-keys";

export function useSessionsQuery(status?: string) {
  return useQuery({
    queryKey: queryKeys.sessions.list(status),
    queryFn: () => sessionsService.listSessions(status),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useSessionDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(id),
    queryFn: () => sessionsService.getSessionDetail(id),
    enabled: !!id,
  });
}

export function useStartSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sessionsService.startSession(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.sessions.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCompleteSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, review }: { id: string; rating?: number; review?: string }) =>
      sessionsService.completeSession(id, { rating, review }),
    onSuccess: (updated: any) => {
      const wrapper: any = updated?.data || updated;
      const pointsReleased = wrapper?.pointsReleased;
      if (wrapper?.id) queryClient.setQueryData(queryKeys.sessions.detail(wrapper.id), wrapper);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions({} as any) });
      // Feedback per api.md:259 pointsReleased guard — don't lie about release
      if (pointsReleased === true) {
        // toast is handled in dialog for review +3, but generic release handled here for non-review path
      }
    },
  });
}

export function useUpdateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSessionRequest }) =>
      sessionsService.updateSession(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.sessions.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useDisputeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DisputeSessionRequest }) =>
      sessionsService.disputeSession(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.sessions.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}
