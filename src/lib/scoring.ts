import { createClient } from "@supabase/supabase-js";
import type { Score, ChatMessage } from "./supabase";

export interface FilterConfig {
  hot_keywords: string[];
  warm_keywords: string[];
  cold_keywords: string[];
  response_time_hot: number;
  response_time_warm: number;
  boost_ads_score: boolean;
  boost_organic_score: boolean;
  min_messages_hot: number;
  min_messages_warm: number;
}

export interface ConversationInput {
  messages: ChatMessage[];
  source?: string | null;
  created_at?: string | null;
}

export interface ScoringResult {
  score: Score;
  reasons: string[];
}

const DEFAULT_CONFIG: FilterConfig = {
  hot_keywords: ["giá", "bao nhiêu", "mua", "đặt hàng", "báo giá", "chi phí", "order"],
  warm_keywords: ["thông tin", "tư vấn", "hỏi", "như thế nào", "hợp tác"],
  cold_keywords: [],
  response_time_hot: 30,
  response_time_warm: 120,
  boost_ads_score: false,
  boost_organic_score: false,
  min_messages_hot: 1,
  min_messages_warm: 1,
};

const configCache = new Map<string, { config: FilterConfig; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function fetchFilterConfig(pageId: string): Promise<FilterConfig> {
  const cached = configCache.get(pageId);
  if (cached && Date.now() < cached.expiresAt) return cached.config;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabaseAdmin
    .from("page_filter_configs")
    .select("*")
    .eq("page_id", pageId)
    .maybeSingle();

  const config: FilterConfig = data
    ? {
        hot_keywords: data.hot_keywords ?? DEFAULT_CONFIG.hot_keywords,
        warm_keywords: data.warm_keywords ?? DEFAULT_CONFIG.warm_keywords,
        cold_keywords: data.cold_keywords ?? DEFAULT_CONFIG.cold_keywords,
        response_time_hot: data.response_time_hot ?? DEFAULT_CONFIG.response_time_hot,
        response_time_warm: data.response_time_warm ?? DEFAULT_CONFIG.response_time_warm,
        boost_ads_score: data.boost_ads_score ?? DEFAULT_CONFIG.boost_ads_score,
        boost_organic_score: data.boost_organic_score ?? DEFAULT_CONFIG.boost_organic_score,
        min_messages_hot: data.min_messages_hot ?? DEFAULT_CONFIG.min_messages_hot,
        min_messages_warm: data.min_messages_warm ?? DEFAULT_CONFIG.min_messages_warm,
      }
    : DEFAULT_CONFIG;

  configCache.set(pageId, { config, expiresAt: Date.now() + CACHE_TTL });
  return config;
}

export function computeScore(conversation: ConversationInput, config: FilterConfig): ScoringResult {
  const reasons: string[] = [];

  const customerMessages = conversation.messages.filter((m) => m.from === "customer");
  const customerText = customerMessages.map((m) => m.text ?? "").join(" ").toLowerCase();
  const messageCount = customerMessages.length;

  // Step 1: Keyword check
  const matchedHot = config.hot_keywords.find((kw) => customerText.includes(kw.toLowerCase()));
  const matchedWarm = config.warm_keywords.find((kw) => customerText.includes(kw.toLowerCase()));

  let baseScore: Score;
  if (matchedHot) {
    baseScore = "Hot";
    reasons.push(`Keyword: ${matchedHot}`);
  } else if (matchedWarm) {
    baseScore = "Warm";
    reasons.push(`Keyword: ${matchedWarm}`);
  } else {
    baseScore = "Cold";
  }

  let score: Score = baseScore;

  // Step 2: Min messages check (uses original baseScore)
  if (baseScore === "Hot" && messageCount < config.min_messages_hot) {
    score = "Warm";
    reasons.push(`Hạ xuống Warm: ${messageCount} tin < ${config.min_messages_hot} tối thiểu`);
  } else if (baseScore === "Warm" && messageCount < config.min_messages_warm) {
    score = "Cold";
    reasons.push(`Hạ xuống Cold: ${messageCount} tin < ${config.min_messages_warm} tối thiểu`);
  }

  // Step 3: Response time boost (from first to last message in conversation)
  const allTimestamps = conversation.messages
    .map((m) => m.timestamp)
    .filter((t): t is string => !!t)
    .map((t) => new Date(t).getTime())
    .filter((t) => !isNaN(t));

  if (allTimestamps.length >= 2) {
    const responseMinutes = (Math.max(...allTimestamps) - Math.min(...allTimestamps)) / 60_000;
    if (score === "Warm" && responseMinutes <= config.response_time_hot) {
      score = "Hot";
      reasons.push(`Response time boost: ${Math.round(responseMinutes)}ph ≤ ${config.response_time_hot}ph → Hot`);
    } else if (score === "Cold" && responseMinutes <= config.response_time_warm) {
      score = "Warm";
      reasons.push(`Response time boost: ${Math.round(responseMinutes)}ph ≤ ${config.response_time_warm}ph → Warm`);
    }
  }

  // Step 4: Source boost
  const source = conversation.source;
  if (config.boost_ads_score && source === "ADS" && score === "Warm") {
    score = "Hot";
    reasons.push("Source boost: ADS");
  }
  if (config.boost_organic_score && !source && score === "Warm") {
    score = "Hot";
    reasons.push("Source boost: Organic");
  }

  return { score, reasons };
}
