import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import {
  CommentSchema,
  pageCommentResponseSchema,
  CommonReactionSchema,
  ReactionType,
} from "@/constracts/interaction.contrast";
import {
  useDeleteReactionMutation,
  useReactionMutation,
} from "@/hooks/mutations/interaction.mutation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ReactionButton } from "./reaction-button";
import { ReplyInput } from "./reply-input";

interface CommentItemProps {
  comment: CommentSchema;
  depth?: number;
}

export function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const [reactionId, setReactionId] = useState<string | null>(
    comment.reactedInfo?.reactionId ?? null,
  );
  const [currentReaction, setCurrentReaction] = useState<ReactionType | null>(
    comment.reactedInfo?.reactionType ?? null,
  );
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const createReactionMutation = useReactionMutation();
  const deleteReactionMutation = useDeleteReactionMutation();

  const handleReact = (type: ReactionType) => {
    createReactionMutation.mutate(
      {
        targetId: comment.id,
        targetType: "COMMENT",
        type,
      },
      {
        onSuccess: (response: CommonReactionSchema) => {
          setReactionId(response.id);
          comment.reactionCount++;
          setCurrentReaction(type);
          toast.success("Reacted successfully");
        },
      },
    );
  };

  const handleUnreact = () => {
    if (!reactionId) return;
    deleteReactionMutation.mutate(reactionId, {
      onSuccess: () => {
        setReactionId(null);
        setCurrentReaction(null);
      },
    });
  };

  const { data: replies, isLoading: loadingReplies } = useQuery<
    CommentSchema[]
  >({
    queryKey: ["comments", comment.essayId, comment.id],
    queryFn: async () => {
      const { status, body } = await api.interaction.getComments({
        query: {
          essayId: comment.essayId,
          parentId: comment.id,
          page: 0,
          size: 5,
        },
      });

      if (status !== 200) throw new Error("Failed to fetch replies");
      const parsed = pageCommentResponseSchema.parse(body);
      return parsed.content;
    },
    enabled: showReplies,
  });

  return (
    <div className="space-y-2" style={{ marginLeft: depth * 16 }}>
      <div className="flex space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.user.avatar || "/placeholder.svg"}
            alt={`${comment.user.firstName} ${comment.user.lastName}`}
            className="object-cover"
          />
          <AvatarFallback>{comment.user.firstName.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3">
            <div className="font-medium text-sm">{`${comment.user.firstName} ${comment.user.lastName}`}</div>
            <div className="text-sm">{comment.content}</div>
          </div>

          <div className="flex items-center space-x-3 mt-1 text-xs">
            <ReactionButton
              currentReaction={currentReaction}
              onReact={handleReact}
              onUnreact={handleUnreact}
              disabled={
                createReactionMutation.isLoading ||
                deleteReactionMutation.isLoading
              }
              count={comment.reactionCount}
            />
            <button
              className="hover:text-foreground"
              onClick={() => setShowReplyInput((prev) => !prev)}
            >
              Reply
            </button>
            {comment.replyCount > 0 && (
              <button
                className="hover:text-foreground"
                onClick={() => setShowReplies((prev) => !prev)}
              >
                {showReplies
                  ? "Hide Replies"
                  : `Show ${comment.replyCount} Replies`}
              </button>
            )}
            <span className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt))} ago
            </span>
          </div>

          {showReplyInput && (
            <ReplyInput
              essayId={comment.essayId}
              parentId={comment.id}
              onDone={() => {
                setShowReplyInput(false);
                setShowReplies(true);
              }}
            />
          )}
        </div>
      </div>

      {showReplies && (
        <div className="space-y-2">
          {loadingReplies ? (
            <>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : (
            replies?.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
