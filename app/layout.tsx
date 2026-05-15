import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarProvider } from "@/context/SidebarContext";
import { Cormorant, JetBrains_Mono } from "next/font/google";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const geistMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-geist-mono",
});
 
export const metadata: Metadata = {
  title: "QLA Mentor | Melsoft Holdings",
  description: "Private AI Mentorship - Dan Peña QLA Methodology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${geistMono.variable} dark`} suppressHydrationWarning>
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
