"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const PUBLIC_PATHS = ["/login", "/reset-password", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [loading, user, isPublic, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (loading || redirecting) {
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
