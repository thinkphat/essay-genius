"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { CheckCircle2 } from "lucide-react";
import {
  useSendEmailVerificationMutation,
  useVerifyEmailMutation,
} from "@/hooks/mutations/auth.mutation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [isExpired, setIsExpired] = useState(false);

  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const sendEmailVerificationMutation = useSendEmailVerificationMutation();

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.charAt(0);
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
      if (lastInput) lastInput.focus();
    } else {
      toast.error("Please paste a valid 6-digit code.");
    }
  };

  const verifyEmailMutation = useVerifyEmailMutation();

  const handleVerify = () => {
    const fullCode = code.join("").toUpperCase();

    if (fullCode.length === 6) {
      setIsLoading(true);

      verifyEmailMutation.mutate(
        {
          email,
          code: fullCode,
        },
        {
          onSuccess: (data) => {
            toast.success(data.message || "Email verified successfully!");
            setIsVerified(true);
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

  const handleResend = () => {
    sendEmailVerificationMutation.mutate(
      {
        email,
        type: "VERIFY_EMAIL_WITH_BOTH",
      },
      {
        onSuccess: () => {
          toast.success("Verification email resent!");
          setCountdown(180);
          setIsExpired(false);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  // Countdown logic
  useEffect(() => {
    if (isVerified) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerified]);

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-center">
            {isVerified
              ? "Your email has been successfully verified!"
              : "Enter the 6-digit code sent to your email address"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <p className="text-center">
                Your account is now active. You can now sign in to your account.
              </p>
            </div>
          ) : (
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
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                  />
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>
                  Code expires in {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, "0")}
                </p>
                {isExpired && (
                  <p className="text-red-500">
                    The code has expired. Please resend to get a new one.
                  </p>
                )}
                <p>
                  Didn’t receive a code?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={handleResend}
                  >
                    Resend
                  </Button>
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {isVerified ? (
            <Button className="w-full" asChild>
              <Link href="/sign-in">Continue to Sign In</Link>
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={code.join("").length !== 6 || isLoading || isExpired}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
