import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarProvider } from "@/context/SidebarContext";


export const metadata: Metadata = {
  title: "QLA Mentor | Melsoft Holdings",
  description: "Private AI Mentorship - Dan Peña QLA Methodology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Geist+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="h-screen flex flex-col overflow-hidden antialiased">

        <div className="relative z-10 flex h-full w-full">
          <SidebarProvider>
            <AuthGuard>{children}</AuthGuard>
          </SidebarProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
