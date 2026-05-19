"use client";

import { type Score } from "@/lib/supabase";
import clsx from "clsx";

type FilterValue = Score | "All";

interface FilterBarProps {
  active: FilterValue;
  counts: Record<FilterValue, number>;
  onChange: (value: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string; activeClass: string }[] = [
  {
    value: "All",
    label: "All",
    activeClass: "bg-sage text-desert-text border-sage-light",
  },
  {
    value: "Hot",
    label: "🔥 Hot",
    activeClass: "bg-terracotta text-desert-text border-terracotta-light",
  },
  {
    value: "Warm",
    label: "☀️ Warm",
    activeClass: "bg-desert-gold text-desert-bg border-desert-gold",
  },
  {
    value: "Cold",
    label: "🌵 Cold",
    activeClass: "bg-cactus text-desert-text border-cactus-light",
  },
];

export function FilterBar({ active, counts, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ value, label, activeClass }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-150",
            active === value
              ? activeClass
              : "border-sage bg-desert-surface text-desert-text/70 hover:bg-desert-surface-2 hover:text-desert-text"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
              active === value
                ? "bg-black/20 text-white"
                : "bg-sage/50 text-desert-text/60"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
