import type { Score } from "./supabase";

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

export interface ScoringInput {
  text: string;
  message_count: number;
  referral_source?: string | null;
  first_message_at?: string | null;
  last_message_at?: string | null;
}

export async function fetchFilterConfig(pageId: string, baseUrl: string): Promise<FilterConfig> {
  const res = await fetch(`${baseUrl}/api/filter-configs?page_id=${encodeURIComponent(pageId)}`);
  if (!res.ok) throw new Error("Failed to fetch filter config");
  return res.json();
}

export function computeScore(input: ScoringInput, config: FilterConfig): Score {
  const textLower = input.text.toLowerCase();

  const hasColdKeyword = config.cold_keywords.some((kw) => textLower.includes(kw.toLowerCase()));
  if (hasColdKeyword) return "Cold";

  const hasHotKeyword = config.hot_keywords.some((kw) => textLower.includes(kw.toLowerCase()));
  const hasWarmKeyword = config.warm_keywords.some((kw) => textLower.includes(kw.toLowerCase()));

  // Tính thời gian phản hồi (phút)
  let responseMinutes: number | null = null;
  if (input.first_message_at && input.last_message_at) {
    const diff =
      new Date(input.last_message_at).getTime() -
      new Date(input.first_message_at).getTime();
    responseMinutes = diff / 60_000;
  }

  const fastEnoughForHot =
    responseMinutes !== null && responseMinutes <= config.response_time_hot;
  const fastEnoughForWarm =
    responseMinutes !== null && responseMinutes <= config.response_time_warm;

  let score: Score = "Cold";

  if (hasHotKeyword && input.message_count >= config.min_messages_hot) {
    score = "Hot";
  } else if (hasWarmKeyword && input.message_count >= config.min_messages_warm) {
    score = "Warm";
  } else if (fastEnoughForHot && input.message_count >= config.min_messages_hot) {
    score = "Hot";
  } else if (fastEnoughForWarm && input.message_count >= config.min_messages_warm) {
    score = "Warm";
  }

  // Boost từ nguồn quảng cáo
  const isAds = input.referral_source === "ADS";
  const isOrganic = !input.referral_source;

  if (config.boost_ads_score && isAds && score === "Warm") score = "Hot";
  if (config.boost_organic_score && isOrganic && score === "Warm") score = "Hot";

  return score;
}
