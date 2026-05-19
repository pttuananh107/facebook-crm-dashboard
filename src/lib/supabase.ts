import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Score = "Hot" | "Warm" | "Cold";

export interface Message {
  id: string | number;
  created_at: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  text?: string;
  score: Score;
  received_at?: string;
}
