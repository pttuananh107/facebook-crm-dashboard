"use client";

import { useEffect, useState } from "react";
import { supabase, type Page } from "@/lib/supabase";

export function usePages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("pages")
      .select("page_id, page_name, is_active")
      .eq("is_active", true)
      .order("page_name")
      .then(({ data }) => {
        setPages((data as Page[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { pages, loading };
}
