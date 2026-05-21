"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const isPublic = pathname === "/login" || pathname === "/reset-password" || pathname === "/register";

  if (isPublic) return <>{children}</>;

  if (loading && !timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-desert-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lagoon border-t-transparent" />
          <p className="text-xs text-night/40">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      <div
        className="transition-all duration-200"
        style={{ paddingLeft: expanded ? 192 : 56 }}
      >
        {children}
      </div>
    </div>
  );
}
