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
    activeClass: "bg-slate-600 text-white border-slate-500",
  },
  {
    value: "Hot",
    label: "Hot",
    activeClass: "bg-red-600 text-white border-red-500",
  },
  {
    value: "Warm",
    label: "Warm",
    activeClass: "bg-yellow-500 text-white border-yellow-400",
  },
  {
    value: "Cold",
    label: "Cold",
    activeClass: "bg-cyan-600 text-white border-cyan-500",
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
              : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          )}
        >
          {label}
          <span
            className={clsx(
              "rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums",
              active === value
                ? "bg-white/20 text-white"
                : "bg-slate-700 text-slate-400"
            )}
          >
            {counts[value] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
