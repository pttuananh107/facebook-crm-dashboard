"use client";

import { Tag, X } from "lucide-react";
import clsx from "clsx";

interface LabelFilterProps {
  labels: string[];
  value: string | null;
  onChange: (label: string | null) => void;
}

export function LabelFilter({ labels, value, onChange }: LabelFilterProps) {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 shrink-0">
        <Tag size={14} className="text-lagoon" />
        <span className="text-xs font-medium hidden sm:inline text-night/60">Labels:</span>
      </div>

      {labels.map((label) => (
        <button
          key={label}
          onClick={() => onChange(value === label ? null : label)}
          className={clsx(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150",
            value === label
              ? "bg-lagoon text-white border-lagoon shadow-sm shadow-lagoon/20"
              : "bg-white text-night border-lagoon/50 hover:border-lagoon hover:bg-desert-surface"
          )}
        >
          {label}
        </button>
      ))}

      {value && (
        <button
          onClick={() => onChange(null)}
          title="Xóa filter label"
          className="flex items-center gap-1 rounded-md border border-lagoon/40 bg-white px-2 py-1 text-xs text-night/50 transition hover:border-terracotta/60 hover:text-terracotta"
        >
          <X size={12} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}
    </div>
  );
}
