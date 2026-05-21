"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  if (pathname === "/login") {
    return <>{children}</>;
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
