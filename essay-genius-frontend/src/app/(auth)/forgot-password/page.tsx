import { Suspense } from "react";
import ForgotPasswordClient from "./forgot-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <ForgotPasswordClient />
    </Suspense>
  );
}
