"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  sendEmailForgotPasswordBodySchema,
  SendEmailForgotPasswordBodySchema,
} from "@/lib/schemas/auth.schema";
import { useSendEmailForgotPasswordMutation } from "@/hooks/mutations/auth.mutation";

export default function ForgotPassword() {
  const router = useRouter();

  const form = useForm<SendEmailForgotPasswordBodySchema>({
    resolver: zodResolver(sendEmailForgotPasswordBodySchema),
    defaultValues: {
      email: "nguyenthinhphat3009+1@gmail.com",
    },
  });

  const { control, handleSubmit, setFocus } = form;

  const mutation = useSendEmailForgotPasswordMutation();

  const onSubmit = (data: SendEmailForgotPasswordBodySchema) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Verification code sent to your email.");
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send verification code.");
      },
    });
  };

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and we'll send you a reset code
          </CardDescription>
        </CardHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="m@example.com"
                          className="pl-10"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Sending..." : "Send Reset Code"}
              </Button>
              <div className="text-center text-sm">
                <Link href="/sign-in" className="text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
