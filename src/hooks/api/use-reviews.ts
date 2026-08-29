import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewsService } from "@/services/reviews.service";
import { CreateReviewRequest } from "@/types/api";
import { queryKeys } from "./query-keys";

export function useSessionReviewsQuery(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.bySession(sessionId),
    queryFn: () => reviewsService.getSessionReviews(sessionId),
    enabled: !!sessionId,
  });
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: CreateReviewRequest }) =>
      reviewsService.submitReview(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.bySession(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
}
