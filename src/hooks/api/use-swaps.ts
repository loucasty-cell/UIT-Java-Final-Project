import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { swapsService } from "@/services/swaps.service";
import {
  CounterSwapProposalRequest,
  CreateSwapProposalRequest,
  RejectSwapProposalRequest,
} from "@/types/api";
import { queryKeys } from "./query-keys";

// ─── Query Hooks (were missing) ──────────────────────────────────────────────

/**
 * Fetch swap proposal history.
 */
export function useSwapHistoryQuery() {
  return useQuery({
    queryKey: ["swaps", "history"] as const,
    queryFn: () => swapsService.getSwapHistory(),
  });
}

/**
 * Fetch pending incoming swap proposals (for instructors).
 */
export function usePendingSwapsQuery() {
  return useQuery({
    queryKey: ["swaps", "pending", "incoming"] as const,
    queryFn: () => swapsService.getPendingIncoming(),
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

export function useCreateSwapProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSwapProposalRequest) => swapsService.createProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}

export function useAcceptSwapProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => swapsService.acceptProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps.all });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}

export function useRejectSwapProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectSwapProposalRequest }) =>
      swapsService.rejectProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}

export function useCounterSwapProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CounterSwapProposalRequest }) =>
      swapsService.counterProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}

export function useCancelSwapProposalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => swapsService.cancelProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swaps.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}
