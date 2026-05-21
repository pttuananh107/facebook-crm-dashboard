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
        <Radio size={13} className="text-lagoon/60" />
        <span className="text-xs font-medium text-white/40 hidden sm:inline">Nguồn:</span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AdSource)}
          className="appearance-none rounded-lg border border-white/10 bg-white/5 pl-3 pr-8 py-1.5 text-xs font-medium text-white/70 outline-none transition focus:border-lagoon/40 focus:ring-1 focus:ring-lagoon/25 cursor-pointer"
          style={{ minWidth: 140 }}
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30"
        />
      </div>
    </div>
  );
}
