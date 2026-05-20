"use client";

import { useState, useMemo } from "react";
import {
  RefreshCw,
  Clock,
  MessageSquare,
  AlertCircle,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { type Score, type Conversation } from "@/lib/supabase";
import { useConversations, type AdSource } from "@/hooks/useConversations";
import { usePages } from "@/hooks/usePages";
import { useAllLabels } from "@/hooks/useAllLabels";
import { ScoreBadge } from "./ScoreBadge";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { DateFilter, type DateRange } from "./DateFilter";
import { PageDropdown } from "./PageDropdown";
import { AdSourceFilter } from "./AdSourceFilter";
import { LabelFilter } from "./LabelFilter";
import { ConversationPanel } from "./ConversationPanel";
import clsx from "clsx";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function lastMessage(conv: Conversation): string {
  const msgs = Array.isArray(conv.messages) ? conv.messages : [];
  if (msgs.length === 0) return "—";
  return msgs[msgs.length - 1].text ?? "—";
}

/** Show up to maxVisible labels then "+N more" */
function LabelBadges({ labels, maxVisible = 2 }: { labels?: string[]; maxVisible?: number }) {
  if (!labels || labels.length === 0) return null;
  const visible = labels.slice(0, maxVisible);
  const rest = labels.length - maxVisible;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {visible.map((l) => (
        <span
          key={l}
          className="rounded-md border border-lagoon/40 bg-lagoon/10 px-1.5 py-0.5 text-[10px] font-medium text-lagoon"
        >
          {l}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded-md border border-lagoon/20 bg-white px-1.5 py-0.5 text-[10px] text-night/40">
          +{rest}
        </span>
      )}
    </div>
  );
}

/** Gold badge for ad_title */
function AdBadge({ title }: { title?: string }) {
  if (!title) return null;
  return (
    <span className="mt-1 inline-flex items-center rounded-md border border-desert-gold/50 bg-desert-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-desert-gold">
      📣 {title}
    </span>
  );
}

export function MessageTable() {
  const [filter, setFilter] = useState<Score | "All">("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [adSource, setAdSource] = useState<AdSource>("All");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  const { pages, loading: pagesLoading } = usePages();
  const { labels: allLabels } = useAllLabels();
  const { conversations, loading, error, lastRefreshed, countdown, refetch } =
    useConversations(filter, search, dateRange, selectedPageId, adSource, labelFilter);

  const counts = useMemo(() => {
    const base = { All: 0, Hot: 0, Warm: 0, Cold: 0 } as Record<Score | "All", number>;
    conversations.forEach((c) => {
      base[c.score] = (base[c.score] ?? 0) + 1;
      base.All += 1;
    });
    return base;
  }, [conversations]);

  return (
    <>
      <div className="flex flex-col gap-4 animate-fade-in">
        {/* Row 0: Page selector */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-lagoon/30 bg-desert-surface px-3 py-2">
          <PageDropdown
            pages={pages}
            value={selectedPageId}
            onChange={setSelectedPageId}
            loading={pagesLoading}
          />
        </div>

        {/* Row 1: Score filters + search + refresh */}
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

        {/* Row 2: Date filter */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-lagoon/30 bg-desert-surface px-3 py-2">
          <DateFilter value={dateRange} onChange={setDateRange} />
        </div>

        {/* Row 3: Ad source + label filter */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-lagoon/30 bg-desert-surface px-3 py-2">
          <AdSourceFilter value={adSource} onChange={setAdSource} />
          {allLabels.length > 0 && (
            <>
              <div className="h-4 w-px bg-lagoon/20 hidden sm:block" />
              <LabelFilter labels={allLabels} value={labelFilter} onChange={setLabelFilter} />
            </>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 text-xs text-night/40">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-lagoon/60" />
            Last updated:{" "}
            {lastRefreshed.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lagoon animate-pulse-dot" />
            Auto-refresh in {countdown}s
          </span>
          {!loading && !error && (
            <span className="flex items-center gap-1.5">
              <MessageSquare size={12} className="text-lagoon/60" />
              {conversations.length} hội thoại
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle size={32} className="text-terracotta" />
              <p className="text-sm text-night/60">Không thể tải dữ liệu</p>
              <p className="text-xs text-terracotta/80">{error}</p>
            </div>
          ) : loading && conversations.length === 0 ? (
            <SkeletonRows />
          ) : conversations.length === 0 ? (
            <EmptyState search={search} filter={filter} dateRange={dateRange} adSource={adSource} labelFilter={labelFilter} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-lagoon/20 bg-desert-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Người gửi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Tin nhắn cuối
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Số tin
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Score
                    </th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conv, idx) => (
                    <tr
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={clsx(
                        "cursor-pointer border-b border-lagoon/10 transition-colors duration-100 hover:bg-desert-surface-2",
                        idx % 2 === 0 ? "bg-white" : "bg-desert-surface/60"
                      )}
                    >
                      {/* Thời gian */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="font-mono text-xs text-night/60">
                          {formatDate(conv.last_message_at ?? conv.created_at ?? "")}
                        </div>
                      </td>

                      {/* Người gửi + labels */}
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-lagoon/30 bg-lagoon/10 px-2 py-0.5 font-mono text-xs text-lagoon whitespace-nowrap">
                          {conv.sender_name ?? conv.sender_id}
                        </span>
                        <LabelBadges labels={conv.labels} />
                      </td>

                      {/* Tin nhắn cuối + ad badge */}
                      <td className="max-w-[320px] px-4 py-3">
                        <p className="line-clamp-2 text-night/70">{lastMessage(conv)}</p>
                        <AdBadge title={conv.ad_title} />
                      </td>

                      {/* Số tin */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-lagoon/10 px-1.5 text-xs font-bold tabular-nums text-lagoon">
                          {conv.message_count}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3 text-center">
                        <ScoreBadge score={conv.score} />
                      </td>

                      {/* Arrow */}
                      <td className="pr-3">
                        <ChevronRight size={14} className="text-lagoon/30" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Conversation side panel */}
      <ConversationPanel
        conversation={activeConv}
        onClose={() => setActiveConv(null)}
      />
    </>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-lagoon/10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
          <div className="h-4 w-28 rounded-md bg-lagoon/10" />
          <div className="h-5 w-24 rounded-md bg-lagoon/10" />
          <div className="h-4 flex-1 rounded-md bg-lagoon/10" />
          <div className="h-6 w-8 rounded-full bg-lagoon/10" />
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
  adSource,
  labelFilter,
}: {
  search: string;
  filter: string;
  dateRange: DateRange;
  adSource: AdSource;
  labelFilter: string | null;
}) {
  const hasDateFilter = dateRange.from || dateRange.to;
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Inbox size={36} className="text-lagoon/30" />
      <p className="text-sm text-night/40">
        {search
          ? `Không tìm thấy hội thoại với "${search}"`
          : labelFilter
          ? `Không có hội thoại với label "${labelFilter}"`
          : adSource !== "All"
          ? `Không có hội thoại từ nguồn "${adSource === "ADS" ? "quảng cáo" : "organic"}"`
          : hasDateFilter
          ? "Không có hội thoại trong khoảng thời gian này"
          : filter !== "All"
          ? `Không có hội thoại ${filter}`
          : "Không có hội thoại nào"}
      </p>
    </div>
  );
}
