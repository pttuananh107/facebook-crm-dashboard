"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Clock, MessageSquare, AlertCircle, Inbox } from "lucide-react";
import { type Score } from "@/lib/supabase";
import { useMessages } from "@/hooks/useMessages";
import { ScoreBadge } from "./ScoreBadge";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { DateFilter, type DateRange } from "./DateFilter";
import clsx from "clsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function MessageTable() {
  const [filter, setFilter] = useState<Score | "All">("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });

  const { messages, loading, error, lastRefreshed, countdown, refetch } =
    useMessages(filter, search, dateRange);

  const counts = useMemo(() => {
    const base = { All: 0, Hot: 0, Warm: 0, Cold: 0 } as Record<Score | "All", number>;
    messages.forEach((m) => {
      base[m.score] = (base[m.score] ?? 0) + 1;
      base.All += 1;
    });
    return base;
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Toolbar row 1: score filters + search + refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterBar active={filter} counts={counts} onChange={setFilter} />
        <div className="flex-1 min-w-0" />
        <SearchBar value={search} onChange={setSearch} />
        <button
          onClick={refetch}
          disabled={loading}
          title="Refresh now"
          className={clsx(
            "flex items-center gap-2 rounded-lg border border-sage bg-desert-surface px-3 py-2 text-sm text-desert-text/70 transition hover:bg-desert-surface-2 hover:text-desert-text disabled:opacity-50",
          )}
        >
          <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Toolbar row 2: date filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-sage/50 bg-desert-surface/50 px-3 py-2">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-desert-text/40">
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          Last updated: {lastRefreshed.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cactus animate-pulse-dot" />
          Auto-refresh in {countdown}s
        </span>
        {!loading && !error && (
          <span className="flex items-center gap-1.5">
            <MessageSquare size={12} />
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-sage/60 bg-desert-surface shadow-xl shadow-black/40">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-terracotta" />
            <p className="text-sm text-desert-text/60">Failed to load messages</p>
            <p className="text-xs text-terracotta/80">{error}</p>
          </div>
        ) : loading && messages.length === 0 ? (
          <SkeletonRows />
        ) : messages.length === 0 ? (
          <EmptyState search={search} filter={filter} dateRange={dateRange} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-sage/60 bg-desert-surface-2">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-desert-text/40">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-desert-text/40">
                    Người gửi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-desert-text/40">
                    Nội dung
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-desert-text/40">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr
                    key={msg.id}
                    className={clsx(
                      "border-b border-sage/20 transition-colors duration-100 hover:bg-sage/10",
                      idx % 2 === 0 ? "bg-transparent" : "bg-desert-surface-2/50"
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-desert-text/80 font-mono text-xs">{formatDate(msg.received_at ?? '')}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-md bg-sage/40 px-2 py-0.5 font-mono text-xs text-desert-text/70">
                        {msg.sender_name ?? msg.sender_id}
                      </span>
                    </td>
                    <td className="max-w-[400px] px-4 py-3">
                      <p className="line-clamp-2 text-desert-text/80">{msg.text}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBadge score={msg.score} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-sage/20">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
          <div className="h-8 w-28 rounded-md bg-sage/30" />
          <div className="h-5 w-24 rounded-md bg-sage/30" />
          <div className="h-5 flex-1 rounded-md bg-sage/30" />
          <div className="h-6 w-14 rounded-full bg-sage/30" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  search,
  filter,
  dateRange,
}: {
  search: string;
  filter: string;
  dateRange: DateRange;
}) {
  const hasDateFilter = dateRange.from || dateRange.to;
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Inbox size={36} className="text-sage-light" />
      <p className="text-sm text-desert-text/50">
        {search
          ? `No messages matching "${search}"`
          : hasDateFilter
          ? "No messages in the selected date range"
          : filter !== "All"
          ? `No ${filter} messages found`
          : "No messages found"}
      </p>
    </div>
  );
}
