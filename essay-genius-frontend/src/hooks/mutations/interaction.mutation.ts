import {
  CommonReactionSchema,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateReactionRequest,
  PageCommentRequest,
} from "@/constracts/interaction.contrast";
import { api } from "@/lib/api";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCommentMutation() {
  return useMutation<CreateCommentResponse, unknown, CreateCommentRequest>({
    mutationKey: ["interaction", "comment"],
    mutationFn: async (body) => {
      const response = await api.interaction.createComment({ body });

      if (response.status === 201) {
        return response.body;
      }

      throw new Error("Failed to create comment");
    },
  });
}

export function useReactionMutation() {
  return useMutation<CommonReactionSchema, unknown, CreateReactionRequest>({
    mutationKey: ["interaction", "reaction"],
    mutationFn: async (body) => {
      const response = await api.interaction.createReaction({ body });

      if (response.status === 201) {
        return response.body;
      }

      throw new Error("Failed to create reaction");
    },
  });
}

export function useDeleteReactionMutation(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (id: string) => {
      return api.interaction.deleteReaction({ params: { id } });
    },
    onSuccess: async (response) => {
      switch (response.status) {
        case 200:
          toast.success(response.body.message);
          onSuccess?.();
          break;
        default:
          toast.error("Delete reaction failed");
      }
    },
    onError: () => {
      toast.error("Failed to delete reaction");
    },
  });
}

export function useComments(params: PageCommentRequest, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: [
      "comments",
      params.essayId,
      params.parentId ?? null,
      params.createdBy ?? null,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const { status, body } = await api.interaction.getComments({
        query: {
          essayId: params.essayId,
          parentId: params.parentId,
          createdBy: params.createdBy,
          page: pageParam,
          size: params.size,
        },
      });

      if (status !== 200) {
        throw new Error((body as any)?.message || "Failed to fetch comments");
      }

      return body;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.pageable.pageNumber + 1,
    enabled,
  });
}
