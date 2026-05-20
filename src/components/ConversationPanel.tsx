"use client";

import { X, User, MessageSquare } from "lucide-react";
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
  return new Date(iso).toLocaleTimeString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationPanel({ conversation, onClose }: ConversationPanelProps) {
  if (!conversation) return null;

  const msgs = Array.isArray(conversation.messages) ? conversation.messages : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-night/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="fixed right-0 top-0 z-40 flex h-full w-full max-w-[420px] flex-col border-l border-lagoon/30 bg-white shadow-2xl shadow-night/20">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-lagoon/20 bg-night px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lagoon/20 text-lagoon">
            <User size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {conversation.sender_name ?? conversation.sender_id}
            </p>
            <p className="truncate font-mono text-xs text-white/40">
              {conversation.sender_id}
            </p>
          </div>
          <ScoreBadge score={conversation.score} />
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
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
            <span>
              Từ {formatTime(conversation.first_message_at)}
            </span>
          )}
        </div>

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
                    "flex flex-col",
                    isPage ? "items-end self-end" : "items-start self-start",
                    "max-w-[82%]"
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
