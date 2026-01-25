import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import { Toaster } from "sonner";
import { QueryProvider } from "@/provider/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IELTS AI Examiner",
  description: "Get your IELTS writing evaluated by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
              <Header />
              <div className="flex-1">{children}</div>
              <Toaster />
            </div>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
