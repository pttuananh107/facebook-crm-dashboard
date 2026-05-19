"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-desert-text/40 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search messages..."
        className="w-full rounded-lg border border-sage bg-desert-surface py-2 pl-9 pr-9 text-sm text-desert-text placeholder-desert-text/30 outline-none transition focus:border-desert-gold focus:ring-1 focus:ring-desert-gold"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-desert-text/40 hover:text-desert-text transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
