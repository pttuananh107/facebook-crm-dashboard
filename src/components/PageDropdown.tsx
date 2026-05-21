"use client";

import { ChevronDown, Globe } from "lucide-react";
import { type Page } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface PageDropdownProps {
  pages: Page[];
  value: string | null;
  onChange: (pageId: string | null) => void;
  loading?: boolean;
}

export function PageDropdown({ pages, value, onChange, loading }: PageDropdownProps) {
  const { profile } = useAuth();

  const visiblePages =
    profile?.role === "super_admin"
      ? pages
      : pages.filter((p) =>
          (profile?.assigned_page_ids ?? []).includes(p.page_id)
        );

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-lagoon/60 shrink-0">
        <Globe size={13} />
        <span className="text-xs font-medium text-white/40 hidden sm:inline">Fanpage:</span>
      </div>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={loading}
          className="appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 py-1.5 text-xs font-medium text-white/70 outline-none transition focus:border-lagoon/40 focus:ring-1 focus:ring-lagoon/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: 170 }}
        >
          {profile?.role === "super_admin" && (
            <option value="">Tất cả pages</option>
          )}
          {visiblePages.map((page) => (
            <option key={page.page_id} value={page.page_id}>
              {page.page_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30"
        />
      </div>
    </div>
  );
}
