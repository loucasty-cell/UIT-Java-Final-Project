import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forumService } from "@/services/forum.service";
import {
  CreateForumCommentRequest,
  CreateForumPostRequest,
  RewardCommentRequest,
} from "@/types/api";
import { queryKeys } from "./query-keys";

export function useForumPostsQuery(skillId?: string, search?: string) {
  return useQuery({
    queryKey: queryKeys.forum.posts(skillId, search),
    queryFn: () => forumService.getPosts(skillId, search),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateForumPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateForumPostRequest) => forumService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
  });
}

export function useLikeForumPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => forumService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
  });
}

export function useUnlikeForumPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => forumService.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
  });
}

export function useAddForumCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateForumCommentRequest }) =>
      forumService.addComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
  });
}

export function useRewardForumCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: RewardCommentRequest }) =>
      forumService.rewardComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
}
