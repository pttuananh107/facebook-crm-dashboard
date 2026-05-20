"use client";

import { useEffect, useState } from "react";
import { supabase, type Page } from "@/lib/supabase";
import {
  Zap,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function AdminPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ page_id: "", page_name: "", access_token: "" });
  const [formError, setFormError] = useState<string | null>(null);

  async function fetchPages() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("pages")
      .select("*")
      .order("page_name");
    if (err) setError(err.message);
    else setPages((data as Page[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchPages(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.page_id.trim() || !form.page_name.trim()) {
      setFormError("page_id và page_name là bắt buộc");
      return;
    }
    setSaving(true);
    setFormError(null);
    const { error: err } = await supabase.from("pages").insert({
      page_id: form.page_id.trim(),
      page_name: form.page_name.trim(),
      access_token: form.access_token.trim() || null,
      is_active: true,
    });
    if (err) {
      setFormError(err.message);
    } else {
      setForm({ page_id: "", page_name: "", access_token: "" });
      await fetchPages();
    }
    setSaving(false);
  }

  async function toggleActive(page: Page) {
    await supabase
      .from("pages")
      .update({ is_active: !page.is_active })
      .eq("page_id", page.page_id);
    setPages((prev) =>
      prev.map((p) =>
        p.page_id === page.page_id ? { ...p, is_active: !p.is_active } : p
      )
    );
  }

  async function deletePage(page: Page) {
    if (!confirm(`Xóa page "${page.page_name}"?`)) return;
    await supabase.from("pages").delete().eq("page_id", page.page_id);
    setPages((prev) => prev.filter((p) => p.page_id !== page.page_id));
  }

  return (
    <div className="min-h-screen bg-desert-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-lagoon/30 bg-night shadow-sm shadow-lagoon/10">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lagoon">
            <Zap size={16} className="text-night" fill="#052D24" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-white">Facebook CRM</h1>
            <p className="mt-0.5 text-xs text-white/50">Quản lý Pages</p>
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-lagoon/40 bg-lagoon/10 px-3 py-1.5 text-xs font-medium text-lagoon transition hover:bg-lagoon/20"
            >
              <ArrowLeft size={12} />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
            <Globe size={20} className="text-lagoon" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">Quản lý Fanpages</h2>
            <p className="text-sm text-night/50">Thêm, bật/tắt và xóa các Facebook page</p>
          </div>
        </div>

        {/* Add form */}
        <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-night">
            <Plus size={15} className="text-lagoon" />
            Thêm page mới
          </h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-night/60">Page ID *</label>
                <input
                  type="text"
                  placeholder="vd: 123456789"
                  value={form.page_id}
                  onChange={(e) => setForm((f) => ({ ...f, page_id: e.target.value }))}
                  className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-night/60">Page Name *</label>
                <input
                  type="text"
                  placeholder="vd: Shop Thời Trang ABC"
                  value={form.page_name}
                  onChange={(e) => setForm((f) => ({ ...f, page_name: e.target.value }))}
                  className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-night/60">Access Token</label>
              <input
                type="text"
                placeholder="EAAxxxxxx... (tùy chọn)"
                value={form.access_token}
                onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))}
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 font-mono placeholder:text-night/30 placeholder:font-sans"
              />
            </div>
            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
                <AlertCircle size={13} />
                {formError}
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-lagoon px-4 py-2 text-sm font-medium text-white shadow-sm shadow-lagoon/30 transition hover:bg-cactus-dim disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Thêm page
              </button>
            </div>
          </form>
        </div>

        {/* Pages list */}
        <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 overflow-hidden">
          <div className="border-b border-lagoon/20 bg-desert-surface px-5 py-3">
            <h3 className="text-sm font-semibold text-night">
              Danh sách pages{" "}
              <span className="ml-1.5 rounded-full bg-lagoon/10 px-2 py-0.5 text-xs text-lagoon">
                {pages.length}
              </span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-lagoon">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <AlertCircle size={28} className="text-terracotta" />
              <p className="text-sm text-night/60">Không thể tải pages</p>
              <p className="text-xs text-terracotta/80">{error}</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Globe size={32} className="text-lagoon/25" />
              <p className="text-sm text-night/40">Chưa có page nào. Thêm page đầu tiên!</p>
            </div>
          ) : (
            <div className="divide-y divide-lagoon/10">
              {pages.map((page) => (
                <div
                  key={page.page_id}
                  className={clsx(
                    "flex flex-wrap items-center gap-3 px-5 py-4 transition-colors",
                    page.is_active ? "bg-white hover:bg-desert-surface/50" : "bg-desert-surface/40 opacity-60"
                  )}
                >
                  {/* Status dot */}
                  <span
                    className={clsx(
                      "h-2 w-2 shrink-0 rounded-full",
                      page.is_active ? "bg-lagoon animate-pulse" : "bg-night/20"
                    )}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-night text-sm">{page.page_name}</p>
                    <p className="font-mono text-xs text-night/40 mt-0.5">{page.page_id}</p>
                  </div>

                  {/* Badge */}
                  <span
                    className={clsx(
                      "rounded-full border px-2 py-0.5 text-xs font-medium",
                      page.is_active
                        ? "border-lagoon/30 bg-lagoon/10 text-lagoon"
                        : "border-night/20 bg-white text-night/40"
                    )}
                  >
                    {page.is_active ? "Active" : "Inactive"}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleActive(page)}
                      title={page.is_active ? "Tắt page" : "Bật page"}
                      className={clsx(
                        "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                        page.is_active
                          ? "border-lagoon/40 text-lagoon hover:bg-lagoon/10"
                          : "border-night/20 text-night/50 hover:bg-desert-surface"
                      )}
                    >
                      {page.is_active ? (
                        <ToggleRight size={14} className="text-lagoon" />
                      ) : (
                        <ToggleLeft size={14} />
                      )}
                      {page.is_active ? "Tắt" : "Bật"}
                    </button>
                    <button
                      onClick={() => deletePage(page)}
                      title="Xóa page"
                      className="flex items-center gap-1.5 rounded-lg border border-terracotta/30 px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta/5"
                    >
                      <Trash2 size={13} />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
