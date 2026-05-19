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
    // Lagoon Bloom on sage surface
    activeClass: "bg-sage-light text-lagoon border-cactus",
  },
  {
    value: "Hot",
    label: "🔥 Hot",
    // Desert Glow — gold bg, dark text
    activeClass: "bg-desert-gold text-night border-desert-gold",
  },
  {
    value: "Warm",
    label: "☀️ Warm",
    // Cactus Vein — green bg, white text
    activeClass: "bg-cactus text-white border-cactus",
  },
  {
    value: "Cold",
    label: "🌵 Cold",
    // Night bg + Cactus border + Cactus text
    activeClass: "bg-night text-cactus border-cactus",
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
              : "border-sage bg-desert-surface text-desert-text/60 hover:bg-desert-surface-2 hover:text-desert-text"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
              active === value
                ? "bg-black/20 text-white"
                : "bg-sage/60 text-desert-text/50"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
