"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { type DateRange } from "@/components/DateFilter";

export interface SummaryStats {
  total: number;
  uniqueSenders: number;
  hot: number;
  warm: number;
  ads: number;
  organic: number;
}

const EMPTY: SummaryStats = {
  total: 0,
  uniqueSenders: 0,
  hot: 0,
  warm: 0,
  ads: 0,
  organic: 0,
};

export function useSummary(dateRange: DateRange, pageId: string | null) {
  const [stats, setStats] = useState<SummaryStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("conversations")
      .select("sender_id, score, referral_source");

    if (dateRange.from) {
      query = query.gte("last_message_at", `${dateRange.from}T00:00:00+07:00`);
    }

    if (dateRange.to) {
      query = query.lte("last_message_at", `${dateRange.to}T23:59:59+07:00`);
    }

    if (pageId) {
      query = query.eq("page_id", pageId);
    }

    const { data } = await query;

    if (!data) {
      setStats(EMPTY);
      setLoading(false);
      return;
    }

    const senders = new Set<string>();
    let hot = 0, warm = 0, ads = 0, organic = 0;

    for (const row of data as { sender_id: string; score: string; referral_source: string | null }[]) {
      senders.add(row.sender_id);
      if (row.score === "Hot") hot++;
      if (row.score === "Warm") warm++;
      if (row.referral_source === "ADS") ads++;
      else if (!row.referral_source) organic++;
    }

    setStats({
      total: data.length,
      uniqueSenders: senders.size,
      hot,
      warm,
      ads,
      organic,
    });
    setLoading(false);
  }, [dateRange, pageId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading };
}
