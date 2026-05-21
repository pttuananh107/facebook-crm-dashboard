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

  const selected = visiblePages.find((p) => p.page_id === value);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-lagoon shrink-0">
        <Globe size={14} />
        <span className="text-xs font-medium hidden sm:inline text-night/60">
          Fanpage:
        </span>
      </div>
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={loading}
          className="appearance-none rounded-lg border border-lagoon bg-white pl-3 pr-8 py-1.5 text-sm font-medium text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: 180 }}
        >
          <option value="">Tất cả pages</option>
          {visiblePages.map((page) => (
            <option key={page.page_id} value={page.page_id}>
              {page.page_name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-lagoon"
        />
      </div>
      {selected && (
        <span className="hidden sm:inline rounded-full border border-lagoon/30 bg-lagoon/10 px-2 py-0.5 text-xs text-lagoon font-medium">
          {selected.page_name}
        </span>
      )}
    </div>
  );
}
