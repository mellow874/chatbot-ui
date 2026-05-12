import { Inter } from "next/font/google"
import "./globals.css"
import { ReactNode } from "react"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Dan Peña QLA Chatbot",
  description: "Private AI Chatbot",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground h-screen flex flex-col overflow-hidden`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
