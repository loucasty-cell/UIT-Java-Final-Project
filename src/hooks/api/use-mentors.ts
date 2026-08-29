import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mentorsService } from "@/services/mentors.service";
import {
  CreateMentorOfferingRequest,
  MentorSearchFilters,
  PaginationParams,
  UpdateMentorOfferingRequest,
} from "@/types/api";
import { queryKeys } from "./query-keys";

export function useMentorsSearchQuery(filters: MentorSearchFilters = {}) {
  return useQuery({
    queryKey: queryKeys.mentors.list(filters),
    queryFn: () => mentorsService.searchMentors(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useMentorDetailQuery(mentorId: string) {
  return useQuery({
    queryKey: queryKeys.mentors.detail(mentorId),
    queryFn: () => mentorsService.getMentorDetail(mentorId),
    enabled: !!mentorId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useMentorReviewsQuery(mentorId: string, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.mentors.reviews(mentorId, pagination),
    queryFn: () => mentorsService.getMentorReviews(mentorId, pagination),
    enabled: !!mentorId,
  });
}

export function useMyOfferingsQuery() {
  return useQuery({
    queryKey: queryKeys.mentors.myOfferings,
    queryFn: () => mentorsService.getMyOfferings(),
  });
}

/**
 * Fetch real mentor availability for a date range.
 * Used in booking dialog to show only available time slots.
 */
export function useMentorAvailabilityQuery(
  mentorId: string,
  from?: string,
  to?: string,
) {
  return useQuery({
    queryKey: ["mentors", "availability", mentorId, from, to] as const,
    queryFn: () => mentorsService.getAvailability(mentorId, from!, to!),
    enabled: !!mentorId && !!from && !!to,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateOfferingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMentorOfferingRequest) => mentorsService.createOffering(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentors.myOfferings });
      queryClient.invalidateQueries({ queryKey: ["mentors", "list"] });
    },
  });
}

export function useUpdateOfferingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMentorOfferingRequest }) =>
      mentorsService.updateOffering(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentors.myOfferings });
      queryClient.invalidateQueries({ queryKey: ["mentors", "list"] });
    },
  });
}

export function useDeleteOfferingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mentorsService.deleteOffering(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentors.myOfferings });
      queryClient.invalidateQueries({ queryKey: ["mentors", "list"] });
    },
  });
}
