import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { fetchFilterConfig, computeScore } from "@/lib/scoring";
import type { ChatMessage } from "@/lib/supabase";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Facebook webhook verification
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

interface WebhookPayload {
  conversation_id: string;
  page_id: string;
  sender_id: string;
  sender_name?: string;
  messages: ChatMessage[];
  referral_source?: string;
  ad_id?: string;
  ad_title?: string;
  first_message_at?: string;
  last_message_at?: string;
}

export async function POST(req: NextRequest) {
  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { conversation_id, page_id, sender_id, messages } = body;
  if (!conversation_id || !page_id || !sender_id || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const config = await fetchFilterConfig(page_id);
  const { score, reasons } = computeScore(
    { messages, source: body.referral_source },
    config
  );

  const customerMessages = messages.filter((m) => m.from === "customer");
  const timestamps = messages
    .map((m) => m.timestamp)
    .filter((t): t is string => !!t);

  const payload = {
    conversation_id,
    page_id,
    sender_id,
    sender_name: body.sender_name ?? null,
    messages,
    message_count: customerMessages.length,
    score,
    score_reasons: reasons,
    referral_source: body.referral_source ?? null,
    ad_id: body.ad_id ?? null,
    ad_title: body.ad_title ?? null,
    first_message_at: body.first_message_at ?? timestamps[0] ?? null,
    last_message_at: body.last_message_at ?? timestamps.at(-1) ?? null,
  };

  const { error } = await supabaseAdmin
    .from("conversations")
    .upsert(payload, { onConflict: "conversation_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, score, reasons });
}
