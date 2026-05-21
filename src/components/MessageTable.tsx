"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  RefreshCw,
  Clock,
  AlertCircle,
  Inbox,
  Eye,
  Filter,
  ArrowUpDown,
  LayoutList,
  Download,
  BarChart2,
  ChevronDown,
  Check,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { type Score, type Conversation } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useConversations, type AdSource } from "@/hooks/useConversations";
import { usePages } from "@/hooks/usePages";
import { useAllLabels } from "@/hooks/useAllLabels";
import { useSummary } from "@/hooks/useSummary";
import { ScoreBadge } from "./ScoreBadge";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { DateFilter, type DateRange } from "./DateFilter";
import { PageDropdown } from "./PageDropdown";
import { AdSourceFilter } from "./AdSourceFilter";
import { LabelFilter } from "./LabelFilter";
import { ConversationPanel } from "./ConversationPanel";
import { SummaryCards } from "./SummaryCards";
import clsx from "clsx";

type SortOption = "newest" | "oldest" | "score_high" | "score_low";
type PageSize = 10 | 25 | 50;

const SCORE_RANK: Record<Score, number> = { Hot: 3, Warm: 2, Cold: 1 };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) {
    const diffM = Math.floor(diffMs / 60_000);
    return diffM <= 0 ? "Vừa xong" : `${diffM}ph trước`;
  }
  if (diffH < 24) return `${diffH}h trước`;
  if (diffH < 48) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function firstMessage(conv: Conversation): string {
  const msgs = Array.isArray(conv.messages) ? conv.messages : [];
  if (msgs.length === 0) return "—";
  return msgs[0].text ?? "—";
}

function getAvatarColors(str: string): [string, string] {
  const palettes: [string, string][] = [
    ["rgba(38,192,189,0.18)", "#26C0BD"],
    ["rgba(64,186,133,0.18)", "#40BA85"],
    ["rgba(242,182,9,0.18)", "#F2B609"],
    ["rgba(38,192,189,0.12)", "#4CD4D1"],
  ];
  const hash = str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return palettes[hash % palettes.length];
}

function Avatar({ name }: { name: string }) {
  const letter = (name ?? "?")[0].toUpperCase();
  const [bg, color] = getAvatarColors(name);
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: bg, color }}
    >
      {letter}
    </span>
  );
}

function SourceBadge({ source, adTitle }: { source?: string; adTitle?: string }) {
  if (source === "ADS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#F2B609]/25 bg-[#F2B609]/10 px-2 py-0.5 text-[10px] font-medium text-[#F2B609]">
        📣 {adTitle ? adTitle.slice(0, 18) : "Quảng cáo"}
      </span>
    );
  }
  return <span className="text-xs text-white/25">Organic</span>;
}

function LabelBadges({ labels, maxVisible = 2 }: { labels?: string[]; maxVisible?: number }) {
  if (!labels || labels.length === 0) return null;
  const visible = labels.slice(0, maxVisible);
  const rest = labels.length - maxVisible;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {visible.map((l) => (
        <span
          key={l}
          className="rounded border border-lagoon/30 bg-lagoon/10 px-1.5 py-0.5 text-[10px] font-medium text-lagoon"
        >
          {l}
        </span>
      ))}
      {rest > 0 && (
        <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
          +{rest}
        </span>
      )}
    </div>
  );
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Mới nhất trước" },
  { value: "oldest",     label: "Cũ nhất trước" },
  { value: "score_high", label: "Score cao nhất" },
  { value: "score_low",  label: "Score thấp nhất" },
];

const TOOLBAR_BTN =
  "inline-flex items-center gap-1.5 rounded-md border border-white/12 bg-white/4 px-2.5 py-1.5 text-xs font-medium text-white/60 transition-all duration-150 hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white/90 select-none";

function exportCSV(convs: Conversation[], filename: string) {
  const headers = ["Thời gian", "Khách hàng", "Score", "Nguồn", "Số tin nhắn"];
  const rows = convs.map((c) => [
    formatDate(c.last_message_at ?? c.created_at ?? ""),
    c.sender_name ?? c.sender_id,
    c.score,
    c.referral_source ?? "Organic",
    String(c.message_count),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function MessageTable() {
  const { profile } = useAuth();
  const [filter, setFilter] = useState<Score | "All">("All");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({ from: "", to: "" });
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [adSource, setAdSource] = useState<AdSource>("All");
  const [labelFilter, setLabelFilter] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  // Toolbar states
  const [showFilters, setShowFilters] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Table states
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState("");

  const { pages, loading: pagesLoading } = usePages();

  useEffect(() => {
    if (!profile || profile.role === "super_admin") return;
    const ids = profile.assigned_page_ids ?? [];
    if (ids.length > 0) setSelectedPageId(ids[0]);
  }, [profile]);

  const { labels: allLabels } = useAllLabels();
  const { conversations, loading, error, lastRefreshed, countdown, refetch } =
    useConversations(filter, search, dateRange, selectedPageId, adSource, labelFilter);
  const { stats, loading: statsLoading } = useSummary(dateRange, selectedPageId);

  // Sort
  const sortedConvs = useMemo(() => {
    const s = [...conversations];
    if (sortOption === "oldest") {
      s.sort((a, b) =>
        new Date(a.last_message_at ?? a.created_at ?? 0).getTime() -
        new Date(b.last_message_at ?? b.created_at ?? 0).getTime()
      );
    } else if (sortOption === "score_high") {
      s.sort((a, b) => SCORE_RANK[b.score] - SCORE_RANK[a.score]);
    } else if (sortOption === "score_low") {
      s.sort((a, b) => SCORE_RANK[a.score] - SCORE_RANK[b.score]);
    }
    return s;
  }, [conversations, sortOption]);

  const totalPages = Math.max(1, Math.ceil(sortedConvs.length / pageSize));

  const pageConvs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedConvs.slice(start, start + pageSize);
  }, [sortedConvs, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [conversations, pageSize]);

  // Close sort menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const counts = useMemo(() => {
    const base = { All: 0, Hot: 0, Warm: 0, Cold: 0 } as Record<Score | "All", number>;
    conversations.forEach((c) => {
      base[c.score] = (base[c.score] ?? 0) + 1;
      base.All += 1;
    });
    return base;
  }, [conversations]);

  function toggleRow(id: string) {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPage() {
    const pageIds = pageConvs.map((c) => String(c.id));
    const allSelected = pageIds.every((id) => selectedRows.has(id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  const allPageSelected =
    pageConvs.length > 0 && pageConvs.every((c) => selectedRows.has(String(c.id)));

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  function handleGoToPage() {
    const n = parseInt(goToPage, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      setCurrentPage(n);
      setGoToPage("");
    }
  }

  function handleExport() {
    const toExport =
      selectedRows.size > 0
        ? sortedConvs.filter((c) => selectedRows.has(String(c.id)))
        : sortedConvs;
    exportCSV(toExport, `conversations-${new Date().toISOString().split("T")[0]}.csv`);
  }

  const startRow = (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, sortedConvs.length);
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "Sắp xếp";

  return (
    <>
      <div className="flex flex-col gap-4 animate-fade-in">

        {/* === TOOLBAR === */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Table View (cosmetic) */}
            <button className={TOOLBAR_BTN}>
              <LayoutList size={13} />
              Table View
              <ChevronDown size={11} className="text-white/30" />
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={clsx(
                TOOLBAR_BTN,
                showFilters && "border-lagoon/40 bg-lagoon/10 text-lagoon"
              )}
            >
              <Filter size={13} />
              Bộ lọc
              {showFilters && <X size={11} className="ml-0.5 opacity-60" />}
            </button>

            {/* Sort dropdown */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className={clsx(
                  TOOLBAR_BTN,
                  showSortMenu && "border-lagoon/40 bg-lagoon/10 text-lagoon"
                )}
              >
                <ArrowUpDown size={13} />
                {currentSortLabel}
                <ChevronDown size={11} className="text-white/30" />
              </button>
              {showSortMenu && (
                <div className="absolute left-0 top-full z-40 mt-1.5 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#062e25] shadow-2xl shadow-black/40 animate-fade-in">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortOption(opt.value);
                        setShowSortMenu(false);
                      }}
                      className={clsx(
                        "flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors",
                        sortOption === opt.value
                          ? "bg-lagoon/15 text-lagoon"
                          : "text-white/60 hover:bg-white/5 hover:text-white/90"
                      )}
                    >
                      {opt.label}
                      {sortOption === opt.value && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-white/10" />

            {/* Show Statistics toggle */}
            <button
              onClick={() => setShowStats((v) => !v)}
              className={clsx(
                TOOLBAR_BTN,
                showStats && "border-lagoon/40 bg-lagoon/10 text-lagoon"
              )}
            >
              <BarChart2 size={13} />
              Thống kê
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export */}
            <button onClick={handleExport} className={TOOLBAR_BTN}>
              <Download size={13} />
              Xuất
              {selectedRows.size > 0 && (
                <span className="ml-1 rounded-full bg-lagoon/20 px-1.5 py-0.5 text-[10px] font-bold text-lagoon">
                  {selectedRows.size}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={refetch}
              disabled={loading}
              className={clsx(TOOLBAR_BTN, "disabled:opacity-40")}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>

        {/* === FILTERS SECTION === */}
        {showFilters && (
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 animate-fade-in">
            <div className="flex flex-wrap items-center gap-2">
              <PageDropdown
                pages={pages}
                value={selectedPageId}
                onChange={setSelectedPageId}
                loading={pagesLoading}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FilterBar active={filter} counts={counts} onChange={setFilter} />
              <div className="flex-1 min-w-0" />
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DateFilter value={dateRange} onChange={setDateRange} />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <AdSourceFilter value={adSource} onChange={setAdSource} />
              {allLabels.length > 0 && (
                <>
                  <div className="h-4 w-px bg-white/10 hidden sm:block" />
                  <LabelFilter
                    labels={allLabels}
                    value={labelFilter}
                    onChange={setLabelFilter}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* === SUMMARY CARDS === */}
        {showStats && <SummaryCards stats={stats} loading={statsLoading} />}

        {/* === STATUS BAR === */}
        <div className="flex items-center gap-4 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-lagoon/40" />
            {lastRefreshed
              ? lastRefreshed.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
              : "--:--:--"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lagoon animate-pulse-dot" />
            Tự refresh sau {countdown}s
          </span>
          {!loading && !error && (
            <span>
              {sortedConvs.length.toLocaleString("vi-VN")} hội thoại
            </span>
          )}
        </div>

        {/* === TABLE === */}
        <div className="overflow-hidden rounded-xl border border-white/[0.08]">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertCircle size={32} className="text-terracotta" />
              <p className="text-sm text-white/50">Không thể tải dữ liệu</p>
              <p className="text-xs text-terracotta/70">{error}</p>
            </div>
          ) : loading && conversations.length === 0 ? (
            <SkeletonRows />
          ) : conversations.length === 0 ? (
            <EmptyState
              search={search}
              filter={filter}
              dateRange={dateRange}
              adSource={adSource}
              labelFilter={labelFilter}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-night">
                    {/* Checkbox */}
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAllPage}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-lagoon cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Tin nhắn
                    </th>
                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Nguồn
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Thời gian
                    </th>
                    <th className="w-12 px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageConvs.map((conv) => {
                    const rowId = String(conv.id);
                    const isSelected = selectedRows.has(rowId);
                    return (
                      <tr
                        key={conv.id}
                        className={clsx(
                          "relative border-b border-white/[0.05] transition-colors duration-100",
                          isSelected
                            ? "bg-lagoon/[0.08]"
                            : "hover:bg-white/[0.04]"
                        )}
                      >
                        {/* Selected left border */}
                        {isSelected && (
                          <td
                            colSpan={0}
                            className="absolute left-0 top-0 h-full w-[3px] bg-lagoon rounded-r"
                            aria-hidden
                          />
                        )}

                        {/* Checkbox */}
                        <td className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(rowId)}
                            className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-lagoon cursor-pointer"
                          />
                        </td>

                        {/* Khách hàng */}
                        <td
                          className="cursor-pointer px-4 py-3"
                          onClick={() => setActiveConv(conv)}
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar name={conv.sender_name ?? conv.sender_id} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white/85">
                                {conv.sender_name ?? conv.sender_id}
                              </p>
                              {conv.sender_name && (
                                <p className="truncate text-[10px] font-mono text-white/30">
                                  {conv.sender_id}
                                </p>
                              )}
                              <LabelBadges labels={conv.labels} />
                            </div>
                          </div>
                        </td>

                        {/* Tin nhắn */}
                        <td
                          className="max-w-[280px] cursor-pointer px-4 py-3"
                          onClick={() => setActiveConv(conv)}
                        >
                          <p className="line-clamp-2 text-xs text-white/55 leading-relaxed">
                            {firstMessage(conv)}
                          </p>
                        </td>

                        {/* Score */}
                        <td className="cursor-pointer px-4 py-3 text-center" onClick={() => setActiveConv(conv)}>
                          <ScoreBadge score={conv.score} reasons={conv.score_reasons} />
                        </td>

                        {/* Nguồn */}
                        <td className="cursor-pointer px-4 py-3" onClick={() => setActiveConv(conv)}>
                          <SourceBadge source={conv.referral_source} adTitle={conv.ad_title} />
                        </td>

                        {/* Thời gian */}
                        <td className="cursor-pointer whitespace-nowrap px-4 py-3" onClick={() => setActiveConv(conv)}>
                          <span
                            className="text-xs text-white/40"
                            title={formatDate(conv.last_message_at ?? conv.created_at ?? "")}
                          >
                            {formatDateShort(conv.last_message_at ?? conv.created_at ?? "")}
                          </span>
                        </td>

                        {/* Hành động */}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => setActiveConv(conv)}
                            title="Xem chi tiết"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/35 transition hover:border-lagoon/40 hover:bg-lagoon/10 hover:text-lagoon"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* === PAGINATION === */}
        {!error && sortedConvs.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Per page + info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value) as PageSize);
                  }}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60 outline-none transition focus:border-lagoon/40 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>mỗi trang</span>
              </div>
              {sortedConvs.length > 0 && (
                <span className="text-xs text-white/25">
                  {startRow}–{endRow} / {sortedConvs.length}
                </span>
              )}
            </div>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/4 text-white/40 transition hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronsLeft size={13} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/4 text-white/40 transition hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} />
              </button>

              {pageNumbers.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-white/25">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={clsx(
                      "flex h-7 min-w-[28px] items-center justify-center rounded-md border px-1.5 text-xs font-medium transition",
                      currentPage === p
                        ? "border-lagoon/50 bg-lagoon/20 text-lagoon"
                        : "border-white/10 bg-white/4 text-white/45 hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/4 text-white/40 transition hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={13} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/4 text-white/40 transition hover:border-lagoon/35 hover:bg-lagoon/8 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronsRight size={13} />
              </button>
            </div>

            {/* Go to page */}
            <div className="flex items-center gap-2 text-xs text-white/35">
              <span>Trang</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                className="w-14 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60 outline-none transition focus:border-lagoon/40 text-center"
                placeholder={String(currentPage)}
              />
              <button
                onClick={handleGoToPage}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 transition hover:border-lagoon/35 hover:bg-lagoon/10 hover:text-lagoon"
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>

      {/* === BULK ACTION BAR === */}
      {selectedRows.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-[#062e25] px-5 py-3 shadow-2xl shadow-black/50 backdrop-blur-sm">
            <span className="text-sm font-semibold text-white">
              {selectedRows.size} đã chọn
            </span>
            <div className="mx-2 h-4 w-px bg-white/15" />
            <button
              onClick={() => setSelectedRows(new Set())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-lagoon/30 bg-lagoon/15 px-3 py-1.5 text-xs font-medium text-lagoon transition hover:bg-lagoon/25"
            >
              <Check size={12} />
              Đánh dấu đã xử lý
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/15 hover:text-white"
            >
              <Download size={12} />
              Xuất
            </button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 size={12} />
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* === CONVERSATION PANEL === */}
      <ConversationPanel
        conversation={activeConv}
        onClose={() => setActiveConv(null)}
      />
    </>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-white/[0.05]">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
          <div className="h-3.5 w-3.5 rounded bg-white/6" />
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-white/6" />
            <div className="h-4 w-24 rounded-md bg-white/6" />
          </div>
          <div className="h-3.5 flex-1 rounded-md bg-white/5" />
          <div className="h-6 w-14 rounded-full bg-white/6" />
          <div className="h-5 w-16 rounded-full bg-white/5" />
          <div className="h-4 w-20 rounded-md bg-white/5" />
          <div className="h-7 w-7 rounded-md bg-white/6" />
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
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <Inbox size={36} className="text-white/15" />
      <p className="text-sm text-white/35">
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
