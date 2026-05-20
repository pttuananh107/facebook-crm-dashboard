"use client";

import { ChevronDown, Radio } from "lucide-react";
import { type AdSource } from "@/hooks/useConversations";

interface AdSourceFilterProps {
  value: AdSource;
  onChange: (v: AdSource) => void;
}

const OPTIONS: { value: AdSource; label: string }[] = [
  { value: "All",     label: "Tất cả nguồn" },
  { value: "Organic", label: "Organic" },
  { value: "ADS",     label: "Từ quảng cáo" },
];

export function AdSourceFilter({ value, onChange }: AdSourceFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 shrink-0">
        <Radio size={14} className="text-lagoon" />
        <span className="text-xs font-medium hidden sm:inline text-night/60">Nguồn:</span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AdSource)}
          className="appearance-none rounded-lg border border-lagoon bg-white pl-3 pr-8 py-1.5 text-sm font-medium text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 cursor-pointer"
          style={{ minWidth: 150 }}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-lagoon"
        />
      </div>
    </div>
  );
}
