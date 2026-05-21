import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "sb-auth-token",
    },
  });
  return _client;
}

// Proxy object - chỉ tạo client khi được gọi thực sự
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

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
