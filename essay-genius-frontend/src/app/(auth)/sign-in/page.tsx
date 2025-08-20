"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signInBodySchema, SignInBodySchema } from "@/lib/schemas/auth.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";
import { setCookie } from "cookies-next/client";
import { COOKIE_KEY_ACCESS_TOKEN, COOKIE_KEY_REFRESH_TOKEN } from "@/constants";

type FormValues = z.infer<typeof signInBodySchema>;

export default function SignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<SignInBodySchema>({
    resolver: zodResolver(signInBodySchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.auth.signIn({ body: data }),
    onSuccess: async (response) => {
      switch (response.status) {
        case 200:
          const { accessToken, refreshToken } = response.body;
          setCookie(COOKIE_KEY_ACCESS_TOKEN, accessToken, {
            httpOnly: false,
          });
          setCookie(COOKIE_KEY_REFRESH_TOKEN, refreshToken, {
            httpOnly: false,
          });
          await queryClient.invalidateQueries({ queryKey: ["current_user"] });
          toast("Login successful");
          router.push("/");
          break;
        default:
          const { errors, message } = response.body;
          if (errors) {
            Object.entries(errors).forEach(([field, message]) => {
              form.setError(field as keyof FormValues, {
                type: "server",
                message: String(message),
              });
            });
            return;
          }

          if (message) {
            form.setError("root", {
              type: String(response.status),
              message,
            });
          }
      }
    },
    onError: () => {
      form.setError("email", {
        type: "server",
        message: "Login failed",
      });
    },
  });

  const onSubmit = (data: SignInBodySchema) => {
    mutation.mutate(data);
  };

  // Focus email on load
  useEffect(() => {
    const emailInput = document.querySelector(
      'input[name="email"]',
    ) as HTMLInputElement;
    emailInput?.focus();
  }, []);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.root.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </FormProvider>
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
