"use client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageSquare, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EssayScoredResponse } from "@/constracts/essay.constract";
import {
  CreateCommentRequest,
  createCommentRequestSchema,
  CreateCommentResponse,
  CommonReactionSchema,
} from "@/constracts/interaction.contrast";
import ReactionDialog from "./reaction-dialog";
import { CommentItem } from "./comment-item";
import {
  useCommentMutation,
  useComments,
  useDeleteReactionMutation,
  useReactionMutation,
} from "@/hooks/mutations/interaction.mutation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ReplyInput } from "./reply-input";

export default function EssayPost({
  essayPost,
}: {
  essayPost: EssayScoredResponse;
}) {
  const [showFullEssay, setShowFullEssay] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [openReactionDialog, setOpenReactionDialog] = useState(false);
  const [stared, setStared] = useState(false);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const commentMutation = useCommentMutation();

  const form = useForm<CreateCommentRequest>({
    resolver: zodResolver(createCommentRequestSchema),
    defaultValues: {
      essayId: essayPost.id,
      parentId: null,
      content: "",
    },
  });

  const createReactionMutation = useReactionMutation();
  const deleteReactionMutation = useDeleteReactionMutation();

  useEffect(() => {
    if (essayPost.reactedInfo?.isReacted) {
      setStared(essayPost.reactedInfo.reactionType === "STAR");
      setReactionId(essayPost.reactedInfo.reactionId ?? null);
    } else {
      setStared(false);
      setReactionId(null);
    }
  }, [essayPost.reactedInfo]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useComments({ essayId: essayPost.id, size: 5 }, showComments);

  const { ref: loadMoreRef } = useInView({
    threshold: 1,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const toggleStar = () => {
    if (stared && reactionId) {
      deleteReactionMutation.mutate(reactionId);
      setStared(false);
    } else {
      createReactionMutation.mutate(
        {
          targetId: essayPost.id,
          targetType: "ESSAY",
          type: "STAR",
        },
        {
          onSuccess: (response: CommonReactionSchema) => {
            toast.success("Starred essay successfully");
            setReactionId(response.id);
            essayPost.stars++;
          },
        },
      );
      setStared(true);
    }
  };

  const handleComment = (data: CreateCommentRequest) => {
    console.log("handleComment", data.content);
    if (data.content.trim()) {
      commentMutation.mutate(data, {
        onSuccess: (response: CreateCommentResponse) => {
          form.reset({ ...data, content: "" });
          if (response.valid) {
            setShowComments(true);
            queryClient.invalidateQueries({
              queryKey: ["comments", essayPost.id, null, null],
            });
          }
          // toast.success("your toxic level is " + response.message);
        },
        onError: (error) => {
          toast("failed to comment");
        },
      });
    }
  };

  const comments = data?.pages.flatMap((page) => page.content) ?? [];

  const truncatedEssay =
    essayPost.essayText.length > 300 && !showFullEssay
      ? `${essayPost.essayText.slice(0, 300)}...`
      : essayPost.essayText;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Avatar className="w-15 h-15">
                <AvatarImage
                  src={essayPost.user.avatar || "/placeholder.svg"}
                  alt={essayPost.user.firstName + essayPost.user.lastName}
                  className="object-cover"
                />
                <AvatarFallback>
                  {essayPost.user.firstName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{`${essayPost.user.firstName} ${essayPost.user.lastName}`}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(essayPost.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                Score: {essayPost.band.toFixed(1)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Save</DropdownMenuItem>
                  <DropdownMenuItem>Report</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Prompt */}
          <div>
            <div className="font-medium mb-2">Prompt:</div>
            <div className="text-sm bg-muted p-3 rounded-md">
              {essayPost.promptText}
            </div>
          </div>

          {/* Essay */}
          <div>
            <div className="font-medium mb-2">Essay:</div>
            <div className="text-sm whitespace-pre-line">{truncatedEssay}</div>
            {essayPost.essayText.length > 300 && (
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setShowFullEssay((prev) => !prev)}
              >
                {showFullEssay ? "Show less" : "Read more"}
              </Button>
            )}
          </div>

          {/* Reactions & Comments */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-1 ${stared ? "text-yellow-500" : ""}`}
                onClick={toggleStar}
                disabled={
                  createReactionMutation.isLoading ||
                  deleteReactionMutation.isLoading
                }
              >
                <Star
                  className={`h-4 w-4 ${stared ? "text-yellow-500" : "text-gray-400"}`}
                />
                <span>{essayPost.stars}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => setOpenReactionDialog(true)}
              >
                <span>🎉</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{essayPost.comments}</span>
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-4">
              {/* Comment list scrollable */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <div className="text-center text-sm text-red-500">
                    Failed to load comments.
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-2">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {hasNextPage && (
                      <div
                        ref={loadMoreRef}
                        className="flex justify-center py-2"
                      >
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <ReplyInput essayId={essayPost.id} parentId={null} />
            </div>
          )}
        </CardContent>
      </Card>

      <ReactionDialog
        open={openReactionDialog}
        onOpenChange={setOpenReactionDialog}
        targetId={essayPost.id}
      />
    </>
  );
}
