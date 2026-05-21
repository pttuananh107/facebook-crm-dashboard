import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "sb-auth-token",
      storage: {
        getItem: (key: string) => {
          if (typeof window === "undefined") return null;
          return window.localStorage.getItem(key);
        },
        setItem: (key: string, value: string) => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(key, value);
        },
        removeItem: (key: string) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(key);
        },
      },
    },
  });
}

// Singleton
const globalForSupabase = globalThis as unknown as {
  _supabase: ReturnType<typeof createSupabaseClient> | undefined;
};

export const supabase = globalForSupabase._supabase ?? createSupabaseClient();
globalForSupabase._supabase = supabase;

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
