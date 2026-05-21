import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CONFIG = {
  hot_keywords: ["giá", "bao nhiêu", "mua", "đặt hàng", "báo giá", "chi phí", "order"],
  warm_keywords: ["thông tin", "tư vấn", "hỏi", "như thế nào", "hợp tác"],
  cold_keywords: [] as string[],
  response_time_hot: 30,
  response_time_warm: 120,
  boost_ads_score: false,
  boost_organic_score: false,
  min_messages_hot: 1,
  min_messages_warm: 1,
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const page_id = req.nextUrl.searchParams.get("page_id");

  if (!page_id) {
    return NextResponse.json({ error: "page_id is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("page_filter_configs")
    .select("*")
    .eq("page_id", page_id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ page_id, ...DEFAULT_CONFIG, is_default: true });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { page_id, page_name, ...rest } = body;

  if (!page_id) {
    return NextResponse.json({ error: "page_id is required" }, { status: 400 });
  }

  const payload = {
    page_id,
    page_name: page_name ?? null,
    ...rest,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("page_filter_configs")
    .upsert(payload, { onConflict: "page_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
