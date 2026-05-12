"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authenticated = localStorage.getItem("qla_authenticated");

    // Allow access to login page without authentication
    if (pathname === "/login") {
      setIsReady(true);
      if (authenticated === "true") {
        router.push("/");
      }
      return;
    }

    // For protected routes, check authentication
    if (authenticated !== "true") {
      router.push("/login");
      return;
    }

    setIsReady(true);
  }, [router, pathname]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
