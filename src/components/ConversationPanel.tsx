"use client";

import { X, User, MessageSquare, Tag, Megaphone } from "lucide-react";
import { type Conversation } from "@/lib/supabase";
import { ScoreBadge } from "./ScoreBadge";
import clsx from "clsx";

interface ConversationPanelProps {
  conversation: Conversation | null;
  onClose: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function formatShortTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tz = "Asia/Ho_Chi_Minh";
  const timeStr = d.toLocaleTimeString("vi-VN", { timeZone: tz, hour: "2-digit", minute: "2-digit" });
  const todayStr = now.toLocaleDateString("sv-SE", { timeZone: tz });
  const msgStr = d.toLocaleDateString("sv-SE", { timeZone: tz });
  if (msgStr === todayStr) return timeStr;
  const [y, m, day] = msgStr.split("-");
  const sameYear = y === todayStr.split("-")[0];
  return sameYear ? `${day}/${m} ${timeStr}` : `${day}/${m}/${y} ${timeStr}`;
}

export function ConversationPanel({ conversation, onClose }: ConversationPanelProps) {
  if (!conversation) return null;

  const msgs = Array.isArray(conversation.messages) ? conversation.messages : [];
  const labels = Array.isArray(conversation.labels) ? conversation.labels : [];
  const hasAd = !!(conversation.ad_title || conversation.ad_id || conversation.referral_source);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-[#0A1F16]/15 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-lagoon/30 bg-white shadow-2xl shadow-[#0A1F16]/10">

        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#E0EBE4] bg-[#F0F4F1] px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lagoon/20 text-lagoon">
            <User size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[#0A1F16]">
              {conversation.sender_name ?? conversation.sender_id}
            </p>
            <p className="truncate font-mono text-xs text-[#5A7A6A]">
              {conversation.sender_id}
            </p>
          </div>
          <ScoreBadge score={conversation.score} />
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#5A7A6A] transition hover:bg-[#E0EBE4] hover:text-[#0A1F16]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Meta bar */}
        <div className="shrink-0 flex items-center justify-between border-b border-lagoon/10 bg-desert-surface px-4 py-2 text-xs text-night/50">
          <span className="flex items-center gap-1.5">
            <MessageSquare size={11} className="text-lagoon/60" />
            {conversation.message_count} tin nhắn
          </span>
          {conversation.first_message_at && (
            <span>Từ {formatTime(conversation.first_message_at)}</span>
          )}
        </div>

        {/* Labels section */}
        {labels.length > 0 && (
          <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-lagoon/10 bg-white px-4 py-2.5">
            <Tag size={12} className="text-lagoon/60 shrink-0" />
            {labels.map((l) => (
              <span
                key={l}
                className="rounded-md border border-lagoon/40 bg-lagoon/10 px-2 py-0.5 text-xs font-medium text-lagoon"
              >
                {l}
              </span>
            ))}
          </div>
        )}

        {/* Ad info section */}
        {hasAd && (
          <div className="shrink-0 border-b border-lagoon/10 bg-desert-surface/60 px-4 py-2.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Megaphone size={12} className="text-desert-gold shrink-0" />
              <span className="text-xs font-semibold text-desert-gold">Nguồn quảng cáo</span>
            </div>
            <div className="flex flex-col gap-1">
              {conversation.ad_title && (
                <div className="flex items-baseline gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-night/40 uppercase tracking-wider">Tên QC</span>
                  <span className="text-xs text-night/80 font-medium">{conversation.ad_title}</span>
                </div>
              )}
              {conversation.ad_id && (
                <div className="flex items-baseline gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-night/40 uppercase tracking-wider">Ad ID</span>
                  <span className="font-mono text-xs text-night/60">{conversation.ad_id}</span>
                </div>
              )}
              {conversation.referral_source && (
                <div className="flex items-baseline gap-2">
                  <span className="w-16 shrink-0 text-[10px] text-night/40 uppercase tracking-wider">Nguồn</span>
                  <span className="rounded border border-desert-gold/40 bg-desert-gold/10 px-1.5 py-0.5 text-[10px] font-medium text-desert-gold">
                    {conversation.referral_source}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bubble list */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
          {msgs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm text-night/30">
              Không có tin nhắn
            </div>
          ) : (
            msgs.map((msg, i) => {
              const isPage = msg.from === "page";
              return (
                <div
                  key={i}
                  className={clsx(
                    "flex flex-col max-w-[82%]",
                    isPage ? "items-end self-end" : "items-start self-start"
                  )}
                >
                  <div
                    className={clsx(
                      "px-3.5 py-2 text-sm leading-relaxed",
                      isPage
                        ? "rounded-2xl rounded-tr-sm bg-lagoon text-white"
                        : "rounded-2xl rounded-tl-sm border border-lagoon/20 bg-desert-surface text-night"
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <span className="mt-0.5 px-1 text-[10px] text-night/30">
                      {formatShortTime(msg.timestamp)}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-lagoon/20 bg-desert-surface px-4 py-2 text-xs text-night/40">
          {conversation.last_message_at && (
            <span>Lần cuối: {formatTime(conversation.last_message_at)}</span>
          )}
        </div>
      </div>
    </>
  );
}
