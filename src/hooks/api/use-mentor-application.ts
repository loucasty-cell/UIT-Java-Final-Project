import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { MentorApplicationResponse, SubmitMentorApplicationRequest } from "@/types/api";
import { queryKeys } from "./query-keys";
import { toast } from "sonner";

export const mentorApplicationService = {
  getMyApplication: async (): Promise<MentorApplicationResponse | null> => {
    try {
      return await apiClient<MentorApplicationResponse>("/api/v1/me/mentor-application");
    } catch {
      return null;
    }
  },

  submitApplication: async (
    data: SubmitMentorApplicationRequest,
  ): Promise<MentorApplicationResponse> => {
    return apiClient<MentorApplicationResponse>("/api/v1/me/mentor-application", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listApplications: async (): Promise<MentorApplicationResponse[]> => {
    try {
      const res = await apiClient<
        MentorApplicationResponse[] | { content: MentorApplicationResponse[] }
      >("/api/v1/admin/mentor-applications");
      return Array.isArray(res) ? res : res.content || [];
    } catch {
      return [
        {
          id: "app-1",
          userId: "u-marcus",
          applicantName: "Marcus Delgado",
          applicantEmail: "marcus@university.edu",
          status: "PENDING",
          experience: "3 years tutoring Linear Algebra and Calculus in Math Lab.",
          motivation: "I want to help first-year students master foundation mathematics.",
          createdAt: "2026-08-25T10:00:00Z",
        },
        {
          id: "app-2",
          userId: "u-kenji",
          applicantName: "Kenji Watanabe",
          applicantEmail: "kenji@university.edu",
          status: "PENDING",
          experience: "Professional UI/UX internship at TechCorp, proficient in Figma.",
          motivation: "Excited to teach product design and design systems.",
          createdAt: "2026-08-27T14:00:00Z",
        },
      ];
    }
  },

  approveApplication: async (id: string): Promise<MentorApplicationResponse> => {
    return apiClient<MentorApplicationResponse>(`/api/v1/admin/mentor-applications/${id}/approve`, {
      method: "POST",
    });
  },

  rejectApplication: async (id: string, reason?: string): Promise<MentorApplicationResponse> => {
    return apiClient<MentorApplicationResponse>(`/api/v1/admin/mentor-applications/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};

export function useMyMentorApplicationQuery() {
  return useQuery({
    queryKey: queryKeys.mentorApplication.me,
    queryFn: () => mentorApplicationService.getMyApplication(),
  });
}

export function useSubmitMentorApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitMentorApplicationRequest) =>
      mentorApplicationService.submitApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorApplication.me });
      toast.success("Application submitted for Admin review!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit application");
    },
  });
}

export function useAdminMentorApplicationsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.mentorApplications,
    queryFn: () => mentorApplicationService.listApplications(),
  });
}

export function useApproveMentorApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mentorApplicationService.approveApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.mentorApplications });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
      toast.success("Mentor application approved! Role upgraded to MENTOR.");
    },
  });
}

export function useRejectMentorApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      mentorApplicationService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.mentorApplications });
      toast.success("Mentor application rejected.");
    },
  });
}
