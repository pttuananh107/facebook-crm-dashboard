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
  {
    label: "Hôm nay",
    getDates: () => ({ from: todayStr(), to: todayStr() }),
  },
  {
    label: "7 ngày qua",
    getDates: () => ({ from: daysAgoStr(6), to: todayStr() }),
  },
  {
    label: "30 ngày qua",
    getDates: () => ({ from: daysAgoStr(29), to: todayStr() }),
  },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  const hasFilter = value.from || value.to;

  function clearFilter() {
    onChange({ from: "", to: "" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-desert-text/50">
        <CalendarDays size={14} />
        <span className="text-xs font-medium hidden sm:inline">Thời gian:</span>
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
                ? "border-desert-gold bg-desert-gold/20 text-desert-gold"
                : "border-sage bg-desert-surface text-desert-text/60 hover:border-desert-gold/50 hover:text-desert-text"
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
          className="rounded-md border border-sage bg-desert-surface px-2 py-1 text-xs text-desert-text/80 outline-none transition focus:border-desert-gold focus:ring-1 focus:ring-desert-gold"
          title="Từ ngày"
        />
        <span className="text-desert-text/30 text-xs">→</span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-md border border-sage bg-desert-surface px-2 py-1 text-xs text-desert-text/80 outline-none transition focus:border-desert-gold focus:ring-1 focus:ring-desert-gold"
          title="Đến ngày"
        />
      </div>

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={clearFilter}
          title="Xóa filter ngày"
          className="flex items-center gap-1 rounded-md border border-sage/50 bg-desert-surface px-2 py-1 text-xs text-desert-text/50 transition hover:border-terracotta/50 hover:text-terracotta"
        >
          <X size={12} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}
    </div>
  );
}
