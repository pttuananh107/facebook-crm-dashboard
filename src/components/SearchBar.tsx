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
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search messages..."
        className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-9 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
