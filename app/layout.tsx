import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "QLA Mentor | Melsoft Holdings",
  description: "Private AI Mentorship - Dan Peña QLA Methodology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground h-screen flex flex-col overflow-hidden">
        <AuthGuard>{children}</AuthGuard>
        <Toaster />
      </body>
    </html>
  );
}
