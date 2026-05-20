"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Clock, MessageSquare, AlertCircle, Inbox } from "lucide-react";
import { type Score } from "@/lib/supabase";
import { useMessages } from "@/hooks/useMessages";
import { usePages } from "@/hooks/usePages";
import { ScoreBadge } from "./ScoreBadge";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { DateFilter, type DateRange } from "./DateFilter";
import { PageDropdown } from "./PageDropdown";
import clsx from "clsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function MessageTable() {
  const [filter, setFilter] = useState<Score | "All">("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const { pages, loading: pagesLoading } = usePages();

  const { messages, loading, error, lastRefreshed, countdown, refetch } =
    useMessages(filter, search, dateRange, selectedPageId);

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
      {/* Page selector */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-lagoon/30 bg-desert-surface px-3 py-2">
        <PageDropdown
          pages={pages}
          value={selectedPageId}
          onChange={setSelectedPageId}
          loading={pagesLoading}
        />
      </div>

      {/* Toolbar row 1: score filters + search + refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterBar active={filter} counts={counts} onChange={setFilter} />
        <div className="flex-1 min-w-0" />
        <SearchBar value={search} onChange={setSearch} />
        <button
          onClick={refetch}
          disabled={loading}
          title="Refresh now"
          className="flex items-center gap-2 rounded-lg border border-lagoon bg-white px-3 py-2 text-sm text-night transition hover:bg-desert-surface disabled:opacity-50"
        >
          <RefreshCw size={14} className={clsx("text-lagoon", loading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Toolbar row 2: date filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-lagoon/30 bg-desert-surface px-3 py-2">
        <DateFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-night/40">
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="text-lagoon/60" />
          Last updated: {lastRefreshed.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lagoon animate-pulse-dot" />
          Auto-refresh in {countdown}s
        </span>
        {!loading && !error && (
          <span className="flex items-center gap-1.5">
            <MessageSquare size={12} className="text-lagoon/60" />
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-terracotta" />
            <p className="text-sm text-night/60">Failed to load messages</p>
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
                <tr className="border-b border-lagoon/20 bg-desert-surface">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                    Người gửi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                    Nội dung
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr
                    key={msg.id}
                    className={clsx(
                      "border-b border-lagoon/10 transition-colors duration-100 hover:bg-desert-surface-2",
                      idx % 2 === 0 ? "bg-white" : "bg-desert-surface/60"
                    )}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-mono text-xs text-night/60">{formatDate(msg.received_at ?? '')}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-md border border-lagoon/30 bg-lagoon/10 px-2 py-0.5 font-mono text-xs text-lagoon">
                        {msg.sender_name ?? msg.sender_id}
                      </span>
                    </td>
                    <td className="max-w-[400px] px-4 py-3">
                      <p className="line-clamp-2 text-night/80">{msg.text}</p>
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
    <div className="divide-y divide-lagoon/10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
          <div className="h-8 w-28 rounded-md bg-lagoon/10" />
          <div className="h-5 w-24 rounded-md bg-lagoon/10" />
          <div className="h-5 flex-1 rounded-md bg-lagoon/10" />
          <div className="h-6 w-14 rounded-full bg-lagoon/10" />
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
      <Inbox size={36} className="text-lagoon/30" />
      <p className="text-sm text-night/40">
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
