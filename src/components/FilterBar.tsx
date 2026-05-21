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
              : "bg-white text-[#5A7A6A] border-[#D0E4D8] hover:bg-[#F0FAF5] hover:text-[#0A1F16] hover:border-[#D0E4D8]"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              active === value
                ? "bg-lagoon/20 text-lagoon"
                : "bg-[#F0F4F1] text-[#5A7A6A]"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
