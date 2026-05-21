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
        <span className="text-xs font-medium text-[#5A7A6A] hidden sm:inline">Nguồn:</span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as AdSource)}
          className="appearance-none rounded-lg border border-[#D0E4D8] bg-white pl-3 pr-8 py-1.5 text-xs font-medium text-[#3A5A4A] outline-none transition focus:border-[#26C0BD] focus:ring-1 focus:ring-[#26C0BD]/25 cursor-pointer"
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
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A7A6A]"
        />
      </div>
    </div>
  );
}
