"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token") ?? "";
    const type = params.get("type");

    if (!accessToken || type !== "recovery") {
      router.replace("/login");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: err }) => {
        if (err) {
          setError("Liên kết không hợp lệ hoặc đã hết hạn.");
        } else {
          setReady(true);
        }
        setLoading(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(updateErr.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?success=password_changed");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-desert-bg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-lagoon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-desert-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lagoon shadow-lg shadow-lagoon/30">
            <Zap size={22} className="text-night" fill="#052D24" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-night">Facebook CRM</h1>
            <p className="text-sm text-night/50">Lead Intelligence Dashboard</p>
          </div>
        </div>

        <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 p-6">
          <h2 className="mb-5 text-sm font-semibold text-night">Đặt mật khẩu mới</h2>

          {!ready ? (
            <div className="flex items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
              <AlertCircle size={13} />
              {error ?? "Liên kết không hợp lệ hoặc đã hết hạn."}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-night/60">Mật khẩu mới</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 8 ký tự"
                  className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-night/60">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
                  <AlertCircle size={13} />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-lagoon/30 transition hover:bg-cactus-dim disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Cập nhật mật khẩu
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
