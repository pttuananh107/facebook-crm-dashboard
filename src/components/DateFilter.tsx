"use client";

import { CalendarDays, X } from "lucide-react";
import clsx from "clsx";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function todayStr() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

function daysAgoStr(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

const QUICK: { label: string; getDates: () => DateRange }[] = [
  { label: "Hôm nay",     getDates: () => ({ from: todayStr(),       to: todayStr() }) },
  { label: "7 ngày qua",  getDates: () => ({ from: daysAgoStr(6),    to: todayStr() }) },
  { label: "30 ngày qua", getDates: () => ({ from: daysAgoStr(29),   to: todayStr() }) },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  const hasFilter = value.from || value.to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-lagoon">
        <CalendarDays size={14} />
        <span className="text-xs font-medium hidden sm:inline text-night/60">Thời gian:</span>
      </div>

      {/* Quick presets */}
      {QUICK.map(({ label, getDates }) => {
        const preset = getDates();
        const isActive = value.from === preset.from && value.to === preset.to;
        return (
          <button
            key={label}
            onClick={() => onChange(isActive ? { from: "", to: "" } : preset)}
            className={clsx(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150",
              isActive
                ? "bg-lagoon text-white border-lagoon shadow-sm shadow-lagoon/20"
                : "bg-white text-night border-lagoon hover:bg-desert-surface"
            )}
          >
            {label}
          </button>
        );
      })}

      {/* Date pickers */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="rounded-md border border-lagoon bg-white px-2 py-1 text-xs text-night outline-none transition focus:ring-2 focus:ring-lagoon/30"
          title="Từ ngày"
        />
        <span className="text-lagoon/50 text-xs font-bold">→</span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-md border border-lagoon bg-white px-2 py-1 text-xs text-night outline-none transition focus:ring-2 focus:ring-lagoon/30"
          title="Đến ngày"
        />
      </div>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={() => onChange({ from: "", to: "" })}
          title="Xóa filter ngày"
          className="flex items-center gap-1 rounded-md border border-lagoon/40 bg-white px-2 py-1 text-xs text-night/50 transition hover:border-terracotta/60 hover:text-terracotta"
        >
          <X size={12} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}
    </div>
  );
}
