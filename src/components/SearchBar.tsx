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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-lagoon pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search messages..."
        className="w-full rounded-lg border border-lagoon bg-white py-2 pl-9 pr-9 text-sm text-night placeholder-night/30 outline-none transition focus:ring-2 focus:ring-lagoon/30"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-night/30 hover:text-night transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
