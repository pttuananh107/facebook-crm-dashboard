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
  { value: "All",  label: "All" },
  { value: "Hot",  label: "🔥 Hot" },
  { value: "Warm", label: "☀️ Warm" },
  { value: "Cold", label: "🌵 Cold" },
];

export function FilterBar({ active, counts, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150",
            active === value
              // active: Lagoon Bloom bg, white text
              ? "bg-lagoon text-white border-lagoon shadow-sm shadow-lagoon/30"
              // inactive: white bg, Night text, Lagoon Bloom border
              : "bg-white text-night border-lagoon hover:bg-desert-surface"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
              active === value
                ? "bg-white/20 text-white"
                : "bg-lagoon/10 text-lagoon"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
