"use client";

import { Flame, Megaphone, MessagesSquare, Users } from "lucide-react";
import { type SummaryStats } from "@/hooks/useSummary";

interface SummaryCardsProps {
  stats: SummaryStats;
  loading: boolean;
}

const CARDS = [
  {
    key: "total" as const,
    label: "Tổng hội thoại",
    Icon: MessagesSquare,
    color: "#26C0BD",
    glow: "rgba(38, 192, 189, 0.12)",
  },
  {
    key: "uniqueSenders" as const,
    label: "Unique senders",
    Icon: Users,
    color: "#26C0BD",
    glow: "rgba(38, 192, 189, 0.12)",
  },
  {
    key: "hot" as const,
    label: "Hot leads",
    Icon: Flame,
    color: "#F2B609",
    glow: "rgba(242, 182, 9, 0.12)",
  },
  {
    key: "ads" as const,
    label: "Từ quảng cáo",
    Icon: Megaphone,
    color: "#F2B609",
    glow: "rgba(242, 182, 9, 0.12)",
  },
];

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map(({ key, label, Icon, color, glow }) => (
        <div
          key={key}
          className="flex flex-col gap-3 rounded-xl border border-[#E0EBE4] bg-white px-5 py-4 shadow-sm transition-all duration-150 hover:border-[#26C0BD]/40"
          style={{
            background: `linear-gradient(135deg, ${glow} 0%, #FFFFFF 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <Icon size={16} style={{ color }} />
          </div>

          {loading ? (
            <div
              className="h-9 w-16 animate-pulse rounded-lg"
              style={{ background: `${color}20` }}
            />
          ) : (
            <p
              className="text-[32px] font-bold leading-none tabular-nums text-[#052D24]"
            >
              {stats[key].toLocaleString("vi-VN")}
            </p>
          )}

          <p className="text-xs text-[#5A7A6A] leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}
