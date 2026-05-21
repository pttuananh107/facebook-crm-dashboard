import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type AnyRecord = Record<string, unknown>;
type AnyTable = { Row: AnyRecord; Insert: AnyRecord; Update: AnyRecord };
type LooseDatabase = {
  public: {
    Tables: { [key: string]: AnyTable };
    Views: { [key: string]: { Row: AnyRecord } };
    Functions: { [key: string]: unknown };
    Enums: { [key: string]: unknown };
  };
};

// Singleton pattern - avoid Multiple GoTrueClient warning
const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<LooseDatabase>> | undefined;
};

export const supabase =
  globalForSupabase.supabase ??
  createClient<LooseDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "fb-crm-auth",
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}


export type Score = "Hot" | "Warm" | "Cold";

export interface ChatMessage {
  id?: string;
  from: "customer" | "page";
  text: string;
  timestamp?: string;
}

export interface Conversation {
  id: string | number;
  conversation_id: string;
  page_id?: string;
  sender_id: string;
  sender_name?: string;
  messages: ChatMessage[];
  message_count: number;
  score: Score;
  labels?: string[];
  ad_id?: string;
  ad_title?: string;
  referral_source?: string;
  first_message_at?: string;
  last_message_at?: string;
  created_at?: string;
}

export interface Page {
  page_id: string;
  page_name: string;
  access_token?: string;
  is_active: boolean;
  created_at?: string;
}
