"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Clock, MessageSquare, AlertCircle, Inbox } from "lucide-react";
import { type Score } from "@/lib/supabase";
import { useMessages } from "@/hooks/useMessages";
import { ScoreBadge } from "./ScoreBadge";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import clsx from "clsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function MessageTable() {
  const [filter, setFilter] = useState<Score | "All">("All");
  const [search, setSearch] = useState("");

  const { messages, loading, error, lastRefreshed, countdown, refetch } =
    useMessages(filter, search);

  const counts = useMemo(() => {
    const base = { All: 0, Hot: 0, Warm: 0, Cold: 0 } as Record<Score | "All", number>;
    // We always show total fetched counts per score from the messages currently loaded.
    // For "All" tab we show total; others show per-score. When filter is active,
    // the other counts won't update — to get accurate counts we'd need a separate query.
    // Simple approach: show count of currently-displayed results.
    messages.forEach((m) => {
      base[m.score] = (base[m.score] ?? 0) + 1;
      base.All += 1;
    });
    return base;
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterBar active={filter} counts={counts} onChange={setFilter} />
        <div className="flex-1 min-w-0" />
        <SearchBar value={search} onChange={setSearch} />
        <button
          onClick={refetch}
          disabled={loading}
          title="Refresh now"
          className={clsx(
            "flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50",
          )}
        >
          <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          Last updated: {lastRefreshed.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-dot" />
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
      <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/50 shadow-xl">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="text-sm text-slate-400">Failed to load messages</p>
            <p className="text-xs text-red-400/80">{error}</p>
          </div>
        ) : loading && messages.length === 0 ? (
          <SkeletonRows />
        ) : messages.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-800/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Người gửi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Nội dung
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => {
                  return (
                    <tr
                      key={msg.id}
                      className={clsx(
                        "border-b border-slate-700/30 transition-colors duration-100 hover:bg-slate-800/60",
                        idx % 2 === 0 ? "bg-transparent" : "bg-slate-800/20"
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-slate-200 font-mono text-xs">{formatDate(msg.received_at ?? '')}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="rounded-md bg-slate-700/60 px-2 py-0.5 font-mono text-xs text-slate-300">
                          {msg.sender_name ?? msg.sender_id}
                        </span>
                      </td>
                      <td className="max-w-[400px] px-4 py-3">
                        <p className="line-clamp-2 text-slate-300">{msg.text}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={msg.score} />
                      </td>
                    </tr>
                  );
                })}
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
    <div className="divide-y divide-slate-700/30">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
          <div className="h-8 w-28 rounded-md bg-slate-700/50" />
          <div className="h-5 w-24 rounded-md bg-slate-700/50" />
          <div className="h-5 flex-1 rounded-md bg-slate-700/50" />
          <div className="h-6 w-14 rounded-full bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, filter }: { search: string; filter: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Inbox size={36} className="text-slate-600" />
      <p className="text-sm text-slate-400">
        {search
          ? `No messages matching "${search}"`
          : filter !== "All"
          ? `No ${filter} messages found`
          : "No messages found"}
      </p>
    </div>
  );
}
