"use client";

import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
