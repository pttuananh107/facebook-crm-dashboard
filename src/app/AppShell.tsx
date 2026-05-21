"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const { loading } = useAuth();

  if (pathname === "/login" || pathname === "/reset-password") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-desert-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-lagoon border-t-transparent" />
          <p className="text-xs text-night/40">Đang tải...</p>
        </div>
      </div>
    );
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
