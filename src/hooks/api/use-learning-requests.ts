/**
 * TanStack Query hooks for Learning Requests.
 * These are THE KEY MISSING MUTATIONS that actually book sessions.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  learningRequestsService,
  type CreateLearningRequestDTO,
  type AcceptRequestDTO,
  type RejectRequestDTO,
  type LearningRequestDirection,
  type LearningRequestStatus,
} from "@/services/learning-requests.service";
import { queryKeys } from "./query-keys";
import { toast } from "sonner";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const learningRequestKeys = {
  all: ["learning-requests"] as const,
  list: (direction?: LearningRequestDirection, status?: LearningRequestStatus) =>
    ["learning-requests", "list", direction, status] as const,
  detail: (id: string) => ["learning-requests", "detail", id] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * List learning requests (incoming or outgoing, filtered by status).
 */
export function useLearningRequestsQuery(
  direction?: LearningRequestDirection,
  status?: LearningRequestStatus,
) {
  return useQuery({
    queryKey: learningRequestKeys.list(direction, status),
    queryFn: () => learningRequestsService.listRequests(direction, status),
  });
}

/**
 * Get a single learning request detail.
 */
export function useLearningRequestDetailQuery(id: string) {
  return useQuery({
    queryKey: learningRequestKeys.detail(id),
    queryFn: () => learningRequestsService.getRequest(id),
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * THE KEY MUTATION — Creates a learning request (books a session).
 * This replaces the toast-only booking on /mentors.
 *
 * On success:
 * - Invalidates learning requests list (so /sessions shows the new request)
 * - Invalidates sessions list
 * - Invalidates wallet balance (escrow may have been deducted for POINTS mode)
 */
export function useCreateLearningRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLearningRequestDTO) =>
      learningRequestsService.createRequest(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: learningRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });

      const modeLabel =
        result.mode === "POINTS"
          ? "Points session"
          : result.mode === "SKILL_SWAP"
            ? "Skill swap"
            : "Volunteer session";
      toast.success(`${modeLabel} request sent!`, {
        description: "Check My Sessions for updates.",
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to send request";
      // Handle specific error types
      if (message.includes("SCHEDULE_CONFLICT") || error?.status === 409) {
        toast.error("Schedule conflict!", {
          description: "This time slot conflicts with an existing session. Please choose another time.",
        });
      } else if (message.includes("INSUFFICIENT") || message.includes("balance")) {
        toast.error("Insufficient points", {
          description: "You don't have enough available points for this session.",
        });
      } else {
        toast.error(message);
      }
    },
  });
}

/**
 * Mentor accepts a learning request.
 * Creates a session and notifies the learner.
 */
export function useAcceptLearningRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: AcceptRequestDTO }) =>
      learningRequestsService.acceptRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list() });
      queryClient.invalidateQueries({ queryKey: ["mentors", "availability"] });
      toast.success("Request accepted! Session scheduled.");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to accept request";
      if (message.includes("SCHEDULE_CONFLICT") || error?.status === 409) {
        toast.error("Schedule conflict!", {
          description: "You have another session at this time. The request cannot be accepted.",
        });
      } else {
        toast.error(message);
      }
    },
  });
}

/**
 * Mentor rejects a learning request.
 * Refunds escrow if POINTS mode.
 */
export function useRejectLearningRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: RejectRequestDTO }) =>
      learningRequestsService.rejectRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      toast.success("Request rejected.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject request");
    },
  });
}

/**
 * Learner cancels their own pending request.
 * Refunds escrow if POINTS mode.
 */
export function useCancelLearningRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => learningRequestsService.cancelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
      toast.success("Request cancelled. Any escrowed points have been refunded.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to cancel request");
    },
  });
}
