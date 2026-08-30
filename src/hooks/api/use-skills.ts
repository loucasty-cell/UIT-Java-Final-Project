import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { skillsService } from "@/services/skills.service";
import { AddUserSkillRequest, SkillDirection, UpdateUserSkillRequest } from "@/types/api";
import { queryKeys } from "./query-keys";

export function useUserSkillsQuery(direction?: SkillDirection) {
  return useQuery({
    queryKey: queryKeys.skills.user(direction),
    queryFn: () => skillsService.getUserSkills(direction),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCatalogSkillsQuery() {
  return useQuery({
    queryKey: queryKeys.skills.catalog,
    queryFn: () => skillsService.getCatalog(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearchCatalogSkillsQuery(query: string) {
  return useQuery({
    queryKey: queryKeys.skills.search(query),
    queryFn: () => skillsService.searchCatalog(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSkillCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.skills.categories,
    queryFn: () => skillsService.getCategories(),
    staleTime: 1000 * 60 * 30,
  });
}

export function useSkillDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.skills.detail(id),
    queryFn: () => skillsService.getSkillById(id),
    enabled: !!id,
  });
}

export function useAddUserSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddUserSkillRequest) => skillsService.addUserSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
    },
  });
}

export function useUpdateUserSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserSkillRequest }) =>
      skillsService.updateUserSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
    },
  });
}

export function useDeleteUserSkillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => skillsService.deleteUserSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
    },
  });
}

export function useUploadCertificateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ skillId, file }: { skillId: string; file: File }) =>
      skillsService.uploadCertificate(skillId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills", "user"] });
    },
  });
}

export function useDownloadCertificateMutation() {
  return useMutation({
    mutationFn: ({ userId, skillId }: { userId: string; skillId: string }) =>
      skillsService.downloadCertificate(userId, skillId),
  });
}
