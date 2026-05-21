"use client";

import { type Score } from "@/lib/supabase";
import clsx from "clsx";

type FilterValue = Score | "All";

interface FilterBarProps {
  active: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "Hot", label: "🔥 Hot" },
  { value: "Warm", label: "☀️ Warm" },
  { value: "Cold", label: "🌵 Cold" },
];

export function FilterBar({ active, counts, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150",
            active === value
              ? "bg-lagoon/20 text-lagoon border-lagoon/50 shadow-sm shadow-lagoon/10"
              : "bg-white/5 text-white/55 border-white/10 hover:bg-white/10 hover:text-white/90 hover:border-white/20"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              active === value
                ? "bg-lagoon/20 text-lagoon"
                : "bg-white/8 text-white/40"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
