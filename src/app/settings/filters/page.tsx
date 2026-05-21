"use client";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePages } from "@/hooks/usePages";
import {
  SlidersHorizontal,
  X,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";

interface FilterConfig {
  page_id: string;
  page_name?: string;
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

const DEFAULT_CONFIG: Omit<FilterConfig, "page_id" | "page_name"> = {
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

type Toast = { type: "success" | "error"; message: string } | null;

// --- TagInput component ---
function TagInput({
  tags,
  onChange,
  placeholder,
  colorClass,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  colorClass: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(value: string) {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-lg border border-lagoon/40 bg-white px-3 py-2 min-h-[44px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className={clsx(
            "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
            colorClass
          )}
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(tags.filter((t) => t !== tag));
            }}
            className="ml-0.5 opacity-60 hover:opacity-100"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent text-sm text-night outline-none placeholder:text-night/30"
      />
    </div>
  );
}

// --- Toggle ---
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        checked ? "bg-lagoon" : "bg-night/20"
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

// --- Section wrapper ---
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-night">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-night/50">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default function FilterSettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { pages } = usePages();

  const [selectedPageId, setSelectedPageId] = useState<string>("");
  const [config, setConfig] = useState<FilterConfig | null>(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!authLoading && profile && profile.role === "viewer") {
      router.replace("/");
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!selectedPageId) return;
    setFetching(true);
    fetch(`/api/filter-configs?page_id=${encodeURIComponent(selectedPageId)}`)
      .then((r) => r.json())
      .then((data) => {
        const page = pages.find((p) => p.page_id === selectedPageId);
        setConfig({ ...data, page_id: selectedPageId, page_name: page?.page_name ?? data.page_name });
      })
      .catch(() => showToast("error", "Không thể tải cấu hình"))
      .finally(() => setFetching(false));
  }, [selectedPageId, pages]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function resetToDefault() {
    if (!config) return;
    setConfig({ ...config, ...DEFAULT_CONFIG });
  }

  function updateConfig<K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/filter-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Lỗi lưu cấu hình");
      }
      showToast("success", "Đã lưu cấu hình thành công");
    } catch (e: unknown) {
      showToast("error", e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !profile || profile.role === "viewer") return null;

  return (
    <div className="min-h-screen bg-desert-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E0EBE4] bg-[#F0F4F1] shadow-sm shadow-[#0A1F16]/5">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lagoon">
            <SlidersHorizontal size={15} className="text-night" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-[#0A1F16]">Facebook CRM</h1>
            <p className="mt-0.5 text-xs text-[#5A7A6A]">Cài đặt bộ lọc theo Fanpage</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
              <SlidersHorizontal size={20} className="text-lagoon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-night">Cài đặt bộ lọc theo Fanpage</h2>
              <p className="text-sm text-night/50">
                Tùy chỉnh từ khóa, thời gian và nguồn tin nhắn để tính điểm từng Fanpage
              </p>
            </div>
          </div>
        </div>

        {/* Page selector */}
        <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 p-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-lagoon/70">
            Chọn Fanpage
          </label>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="w-full rounded-lg border border-lagoon/40 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30"
          >
            <option value="">-- Chọn một Fanpage --</option>
            {pages.map((p) => (
              <option key={p.page_id} value={p.page_id}>
                {p.page_name} ({p.page_id})
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {fetching && (
          <div className="flex items-center justify-center gap-2 py-8 text-lagoon">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Đang tải cấu hình...</span>
          </div>
        )}

        {/* Form sections */}
        {config && !fetching && (
          <>
            {/* Section 1: Keywords */}
            <Section
              title="Keywords"
              description="Nhập từ khóa rồi nhấn Enter hoặc dấu phẩy để thêm. Bấm X để xóa."
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-night/60 flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                  Hot keywords
                </label>
                <TagInput
                  tags={config.hot_keywords}
                  onChange={(v) => updateConfig("hot_keywords", v)}
                  placeholder='vd: "giá", "mua"...'
                  colorClass="bg-red-50 text-red-700 border border-red-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-night/60 flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-desert-gold" />
                  Warm keywords
                </label>
                <TagInput
                  tags={config.warm_keywords}
                  onChange={(v) => updateConfig("warm_keywords", v)}
                  placeholder='vd: "tư vấn", "hỏi"...'
                  colorClass="bg-amber-50 text-amber-700 border border-amber-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-night/60 flex items-center gap-1.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-night/30" />
                  Cold keywords
                </label>
                <TagInput
                  tags={config.cold_keywords}
                  onChange={(v) => updateConfig("cold_keywords", v)}
                  placeholder='vd: "spam", "quảng cáo"...'
                  colorClass="bg-gray-100 text-gray-600 border border-gray-200"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={resetToDefault}
                  className="flex items-center gap-1.5 rounded-lg border border-lagoon/30 px-3 py-1.5 text-xs text-lagoon transition hover:bg-lagoon/10"
                >
                  <RotateCcw size={12} />
                  Reset về mặc định
                </button>
              </div>
            </Section>

            {/* Section 2: Response time */}
            <Section
              title="Thời gian phản hồi"
              description="Hội thoại được phản hồi nhanh hơn ngưỡng này sẽ được boost score"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-night/60">
                    Phản hồi trong X phút → boost{" "}
                    <span className="font-semibold text-red-600">Hot</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={config.response_time_hot}
                      onChange={(e) =>
                        updateConfig("response_time_hot", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-24 rounded-lg border border-lagoon/40 bg-desert-surface px-3 py-2 text-sm text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                    />
                    <span className="text-xs text-night/50">phút</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={240}
                    value={config.response_time_hot}
                    onChange={(e) => updateConfig("response_time_hot", parseInt(e.target.value))}
                    className="accent-red-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-night/60">
                    Phản hồi trong X phút → boost{" "}
                    <span className="font-semibold text-amber-600">Warm</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={config.response_time_warm}
                      onChange={(e) =>
                        updateConfig("response_time_warm", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-24 rounded-lg border border-lagoon/40 bg-desert-surface px-3 py-2 text-sm text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                    />
                    <span className="text-xs text-night/50">phút</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={480}
                    value={config.response_time_warm}
                    onChange={(e) => updateConfig("response_time_warm", parseInt(e.target.value))}
                    className="accent-amber-400"
                  />
                </div>
              </div>
            </Section>

            {/* Section 3: Source boost */}
            <Section
              title="Nguồn tin nhắn"
              description="Tin nhắn từ nguồn được chọn sẽ được ưu tiên hơn (Warm → Hot)"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-lg border border-lagoon/20 bg-desert-surface/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-night">Boost score nếu từ quảng cáo (ADS)</p>
                    <p className="text-xs text-night/50 mt-0.5">
                      Hội thoại từ quảng cáo được Warm → tự động nâng lên Hot
                    </p>
                  </div>
                  <Toggle
                    checked={config.boost_ads_score}
                    onChange={(v) => updateConfig("boost_ads_score", v)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-lagoon/20 bg-desert-surface/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-night">Boost score nếu organic</p>
                    <p className="text-xs text-night/50 mt-0.5">
                      Hội thoại tự nhiên (không qua ads) được Warm → tự động nâng lên Hot
                    </p>
                  </div>
                  <Toggle
                    checked={config.boost_organic_score}
                    onChange={(v) => updateConfig("boost_organic_score", v)}
                  />
                </div>
              </div>
            </Section>

            {/* Section 4: Min messages */}
            <Section
              title="Số tin nhắn tối thiểu"
              description="Chỉ xét điểm Hot/Warm khi hội thoại đạt đủ số tin nhắn"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-night/60">
                    Tối thiểu để xét là{" "}
                    <span className="font-semibold text-red-600">Hot</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={config.min_messages_hot}
                      onChange={(e) =>
                        updateConfig("min_messages_hot", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-24 rounded-lg border border-lagoon/40 bg-desert-surface px-3 py-2 text-sm text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                    />
                    <span className="text-xs text-night/50">tin nhắn</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-night/60">
                    Tối thiểu để xét là{" "}
                    <span className="font-semibold text-amber-600">Warm</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={config.min_messages_warm}
                      onChange={(e) =>
                        updateConfig("min_messages_warm", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-24 rounded-lg border border-lagoon/40 bg-desert-surface px-3 py-2 text-sm text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                    />
                    <span className="text-xs text-night/50">tin nhắn</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-lagoon px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-lagoon/30 transition hover:bg-cactus-dim disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                Lưu cấu hình
              </button>
            </div>
          </>
        )}

        {!selectedPageId && !fetching && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <SlidersHorizontal size={40} className="text-lagoon/20" />
            <p className="text-sm text-night/40">Chọn một Fanpage để xem và chỉnh cấu hình bộ lọc</p>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={clsx(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg animate-fade-in",
            toast.type === "success"
              ? "border-lagoon/30 bg-lagoon/10 text-lagoon"
              : "border-terracotta/30 bg-terracotta/10 text-terracotta"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
