import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth/AuthGuard";
import DottedSurface from "@/components/effects/DottedSurface";

export const metadata: Metadata = {
  title: "QLA Mentor | Melsoft Holdings",
  description: "Private AI Mentorship - Dan Peña QLA Methodology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[var(--obsidian-1)] text-[var(--ink-100)] h-screen flex flex-col overflow-hidden antialiased">
        <DottedSurface />
        <div className="relative z-10 flex h-full w-full">
          <AuthGuard>{children}</AuthGuard>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
