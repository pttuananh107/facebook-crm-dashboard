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
          className="flex flex-col gap-3 rounded-xl border border-white/10 px-5 py-4 transition-all duration-150 hover:border-white/20"
          style={{
            background: `linear-gradient(135deg, ${glow} 0%, rgba(255,255,255,0.03) 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <Icon size={16} style={{ color }} />
          </div>

          {loading ? (
            <div
              className="h-9 w-16 animate-pulse rounded-lg"
              style={{ background: `${color}18` }}
            />
          ) : (
            <p
              className="text-[32px] font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {stats[key].toLocaleString("vi-VN")}
            </p>
          )}

          <p className="text-xs text-white/35 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}
