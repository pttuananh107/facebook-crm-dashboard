"use client";

import { CalendarDays, X } from "lucide-react";
import clsx from "clsx";

export interface DateRange {
  from: string;
  to: string;
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
  { label: "Hôm nay",     getDates: () => ({ from: todayStr(),     to: todayStr() }) },
  { label: "7 ngày qua",  getDates: () => ({ from: daysAgoStr(6),  to: todayStr() }) },
  { label: "30 ngày qua", getDates: () => ({ from: daysAgoStr(29), to: todayStr() }) },
];

export function DateFilter({ value, onChange }: DateFilterProps) {
  const hasFilter = value.from || value.to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <CalendarDays size={13} className="text-lagoon/60" />
        <span className="text-xs font-medium text-[#5A7A6A] hidden sm:inline">Thời gian:</span>
      </div>

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
                ? "bg-lagoon/20 text-lagoon border-lagoon/40"
                : "bg-white text-[#5A7A6A] border-[#D0E4D8] hover:bg-[#F0FAF5] hover:text-[#0A1F16]"
            )}
          >
            {label}
          </button>
        );
      })}

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.from}
          max={value.to || undefined}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="rounded-md border border-[#D0E4D8] bg-white px-2 py-1 text-xs text-[#3A5A4A] outline-none transition focus:border-[#26C0BD] focus:ring-1 focus:ring-[#26C0BD]/25"
          title="Từ ngày"
        />
        <span className="text-[#5A7A6A] text-xs font-bold">→</span>
        <input
          type="date"
          value={value.to}
          min={value.from || undefined}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-md border border-[#D0E4D8] bg-white px-2 py-1 text-xs text-[#3A5A4A] outline-none transition focus:border-[#26C0BD] focus:ring-1 focus:ring-[#26C0BD]/25"
          title="Đến ngày"
        />
      </div>

      {hasFilter && (
        <button
          onClick={() => onChange({ from: "", to: "" })}
          title="Xóa filter ngày"
          className="flex items-center gap-1 rounded-md border border-[#D0E4D8] bg-white px-2 py-1 text-xs text-[#5A7A6A] transition hover:border-red-400 hover:text-red-500"
        >
          <X size={12} />
          <span className="hidden sm:inline">Xóa</span>
        </button>
      )}
    </div>
  );
}
