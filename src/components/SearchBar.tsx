"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A6A] pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm tên khách hàng..."
        className="w-full rounded-lg border border-[#D0E4D8] bg-white py-2 pl-9 pr-9 text-sm text-[#0A1F16] placeholder-[#5A7A6A]/60 outline-none transition focus:border-[#26C0BD] focus:bg-white focus:ring-1 focus:ring-[#26C0BD]/25"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7A6A] hover:text-[#0A1F16] transition"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
