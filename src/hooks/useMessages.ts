"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Message, type Score } from "@/lib/supabase";
import { type DateRange } from "@/components/DateFilter";

const REFRESH_INTERVAL = 30_000;

export function useMessages(
  filter: Score | "All",
  search: string,
  dateRange: DateRange
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "All") {
      query = query.eq("score", filter);
    }

    if (search.trim()) {
      query = query.ilike("content", `%${search.trim()}%`);
    }

    if (dateRange.from) {
      query = query.gte("received_at", `${dateRange.from}T00:00:00+07:00`);
    }

    if (dateRange.to) {
      query = query.lte("received_at", `${dateRange.to}T23:59:59+07:00`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMessages(data as Message[]);
    }

    setLoading(false);
    setLastRefreshed(new Date());
    setCountdown(REFRESH_INTERVAL / 1000);
  }, [filter, search, dateRange]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastRefreshed]);

  return { messages, loading, error, lastRefreshed, countdown, refetch: fetchMessages };
}
