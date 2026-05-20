"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAllLabels() {
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("conversations")
      .select("labels")
      .then(({ data }) => {
        const all = new Set<string>();
        data?.forEach((row: { labels?: unknown }) => {
          if (Array.isArray(row.labels)) {
            row.labels.forEach((l: unknown) => {
              if (typeof l === "string" && l.trim()) all.add(l.trim());
            });
          }
        });
        setLabels(Array.from(all).sort());
      });
  }, []);

  return { labels };
}
