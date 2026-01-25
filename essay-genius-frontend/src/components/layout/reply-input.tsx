import { FormProvider, useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useCommentMutation } from "@/hooks/mutations/interaction.mutation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CreateCommentRequest,
  createCommentRequestSchema,
} from "@/constracts/interaction.contrast";
import { useCurrentUser } from "@/hooks/use-current-user";

type ReplyInputProps = {
  essayId: string;
  parentId: string | null;
  onDone?: () => void;
};

export function ReplyInput({ essayId, parentId, onDone }: ReplyInputProps) {
  const [loading, setLoading] = useState(false);

  const { data: user } = useCurrentUser();
  const form = useForm<CreateCommentRequest>({
    resolver: zodResolver(createCommentRequestSchema),
    defaultValues: {
      essayId,
      parentId,
      content: "",
    },
  });

  const queryClient = useQueryClient();
  const commentMutation = useCommentMutation();

  const handleComment = (data: CreateCommentRequest) => {
    if (!data.content.trim()) return;

    setLoading(true);
    commentMutation.mutate(data, {
      onSuccess: (response) => {
        form.reset({ ...data, content: "" });
        // toast[response.valid ? "success" : "error"](
        //   "Your toxic level is " + response.message,
        // );

        queryClient.invalidateQueries({
          queryKey: ["comments", essayId, parentId],
        });

        onDone?.();
      },
      onError: () => {
        toast.error("Failed to post comment");
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  return (
    <div className="flex items-center space-x-2 mt-2">
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user?.avatar || "/placeholder.svg"}
          alt={`${user?.firstName} ${user?.lastName}`}
          className="h-10 w-10 rounded-full object-cover"
        />
        <AvatarFallback>ME</AvatarFallback>
      </Avatar>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleComment)}
          className="flex-1 flex items-center space-x-2"
        >
          <FormField
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    className="rounded-full bg-muted border-0 h-7 text-xs"
                    placeholder="Write a comment..."
                    required
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            size="icon"
            variant="ghost"
            type="submit"
            className="h-7 w-7"
            disabled={loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
