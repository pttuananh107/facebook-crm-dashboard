"use client";

import { Flame, Sun, Megaphone, Leaf, MessagesSquare, Users } from "lucide-react";
import { type SummaryStats } from "@/hooks/useSummary";
import clsx from "clsx";

interface SummaryCardsProps {
  stats: SummaryStats;
  loading: boolean;
}

type CardDef = {
  key: keyof SummaryStats;
  label: string;
  Icon: React.ElementType;
  color: string;
};

const CARDS: CardDef[] = [
  {
    key: "total",
    label: "Tổng hội thoại",
    Icon: MessagesSquare,
    color: "#26C0BD",
  },
  {
    key: "uniqueSenders",
    label: "Người nhắn tin",
    Icon: Users,
    color: "#26C0BD",
  },
  {
    key: "hot",
    label: "Hot leads",
    Icon: Flame,
    color: "#F2B609",
  },
  {
    key: "warm",
    label: "Warm leads",
    Icon: Sun,
    color: "#40BA85",
  },
  {
    key: "ads",
    label: "Từ quảng cáo",
    Icon: Megaphone,
    color: "#F2B609",
  },
  {
    key: "organic",
    label: "Organic",
    Icon: Leaf,
    color: "#26C0BD",
  },
];

export function SummaryCards({ stats, loading }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map(({ key, label, Icon, color }) => (
        <div
          key={key}
          className="flex flex-col justify-between rounded-xl border border-lagoon/20 bg-night px-4 py-4 shadow-sm shadow-lagoon/5"
        >
          <Icon size={18} style={{ color }} className="mb-3 shrink-0" />

          {loading ? (
            <div
              className="mb-1 h-7 w-14 animate-pulse rounded-md"
              style={{ backgroundColor: `${color}22` }}
            />
          ) : (
            <p
              className="mb-0.5 text-2xl font-bold tabular-nums leading-none"
              style={{ color }}
            >
              {stats[key].toLocaleString("vi-VN")}
            </p>
          )}

          <p className={clsx("text-xs", loading ? "text-white/20" : "text-white/45")}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
