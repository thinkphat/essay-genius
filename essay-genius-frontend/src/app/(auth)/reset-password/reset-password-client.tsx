"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/hooks/mutations/auth.mutation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import {
  resetPasswordBodySchema,
  ResetPasswordBodySchema,
} from "@/lib/schemas/auth.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ResetPassword() {
  const [step, setStep] = useState<"code" | "reset" | "success">("code");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");

  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const form = useForm<ResetPasswordBodySchema>({
    resolver: zodResolver(resetPasswordBodySchema),
    defaultValues: {
      token: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    value = value.toUpperCase();
    const newCode = [...code];
    newCode[index] = value;

    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().toUpperCase();

    if (/^[A-Z0-9]{6}$/.test(pastedData)) {
      const newCode = pastedData.split("").slice(0, 6);
      setCode(newCode);
      const lastInput = document.getElementById("code-5");
      lastInput?.focus();
    } else {
      toast.error("Please paste a valid 6-digit code.");
    }
  };

  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleVerifyCode = () => {
    const fullCode = code.join("").toUpperCase();

    if (fullCode.length === 6) {
      setIsLoading(true);
      forgotPasswordMutation.mutate(
        {
          email,
          code: fullCode,
        },
        {
          onSuccess: (data) => {
            toast.success(data.message || "You are ready to reset password!");
            setToken(data.token);
            setValue("token", data.token);
            setStep("reset");
          },
          onError: (error) => {
            toast.error(error.message);
          },
          onSettled: () => {
            setIsLoading(false);
          },
        },
      );
    }
  };

  const resetPasswordMutation = useResetPasswordMutation();

  const handleResetPassword = (values: ResetPasswordBodySchema) => {
    const { password, passwordConfirmation } = values;

    setIsLoading(true);
    resetPasswordMutation.mutate(
      {
        token,
        password,
        passwordConfirmation,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Password reset successfully!");
          setStep("success");
        },
        onError: (error) => {
          toast.error(error.message);
        },
        onSettled: () => {
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center">
            {step === "code" &&
              "Enter the 6-digit code sent to your email address"}
            {step === "reset" && "Create a new password for your account"}
            {step === "success" && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "code" && (
            <>
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                  />
                ))}
              </div>
              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Didn't receive a code?{" "}
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href="/forgot-password">Try again</Link>
                  </Button>
                </p>
              </div>
            </>
          )}

          {step === "reset" && (
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="passwordConfirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </FormProvider>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center">
                Your password has been reset successfully. You can now sign in
                with your new password.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {step === "code" && (
            <Button
              className="w-full"
              onClick={handleVerifyCode}
              disabled={code.join("").length !== 6 || isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          )}

          {step === "success" && (
            <Button className="w-full" asChild>
              <Link href="/sign-in">Continue to Sign In</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
