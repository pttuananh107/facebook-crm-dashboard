"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Conversation, type Score } from "@/lib/supabase";
import { type DateRange } from "@/components/DateFilter";

const REFRESH_INTERVAL = 30_000;

export type AdSource = "All" | "Organic" | "ADS";

export function useConversations(
  filter: Score | "All",
  search: string,
  dateRange: DateRange,
  pageId: string | null,
  adSource: AdSource,
  labelFilter: string | null
) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (filter !== "All") {
      query = query.eq("score", filter);
    }

    if (search.trim()) {
      query = query.ilike("sender_name", `%${search.trim()}%`);
    }

    if (dateRange.from) {
      query = query.gte("last_message_at", `${dateRange.from}T00:00:00+07:00`);
    }

    if (dateRange.to) {
      query = query.lte("last_message_at", `${dateRange.to}T23:59:59+07:00`);
    }

    if (pageId) {
      query = query.eq("page_id", pageId);
    }

    if (adSource === "ADS") {
      query = query.eq("referral_source", "ADS");
    } else if (adSource === "Organic") {
      query = query.is("referral_source", null);
    }

    if (labelFilter) {
      query = query.contains("labels", [labelFilter]);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setConversations(data as Conversation[]);
    }

    setLoading(false);
    setLastRefreshed(new Date());
    setCountdown(REFRESH_INTERVAL / 1000);
  }, [filter, search, dateRange, pageId, adSource, labelFilter]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshed]);

  return { conversations, loading, error, lastRefreshed, countdown, refetch: fetchConversations };
}
