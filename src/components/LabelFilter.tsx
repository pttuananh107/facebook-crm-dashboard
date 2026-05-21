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
        <Tag size={13} className="text-lagoon/60" />
        <span className="text-xs font-medium text-white/40 hidden sm:inline">Labels:</span>
      </div>

      {labels.map((label) => (
        <button
          key={label}
          onClick={() => onChange(value === label ? null : label)}
          className={clsx(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150",
            value === label
              ? "bg-lagoon/20 text-lagoon border-lagoon/40"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80"
          )}
        >
          {label}
        </button>
      ))}

      {value && (
        <button
          onClick={() => onChange(null)}
          title="Xóa filter label"
          className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/40 transition hover:border-red-500/40 hover:text-red-400"
        >
          <X size={12} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}
    </div>
  );
}
