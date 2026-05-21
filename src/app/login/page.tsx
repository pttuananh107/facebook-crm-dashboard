"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const success = searchParams.get("success");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Kiểm tra status pending
    if (data.user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("status")
        .eq("id", data.user.id)
        .maybeSingle();

      if ((profile as any)?.status === "pending") {
        await supabase.auth.signOut();
        setError("Tài khoản của bạn đang chờ phê duyệt từ admin.");
        setLoading(false);
        return;
      }
    }

    // Đợi session được lưu vào localStorage
    await new Promise((r) => setTimeout(r, 300));
    window.location.href = "/";
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
          <h2 className="mb-5 text-sm font-semibold text-night">Đăng nhập</h2>
          {success === "password_changed" && (
            <div className="flex items-center gap-2 rounded-lg border border-lagoon/30 bg-lagoon/5 px-3 py-2 text-xs text-lagoon mb-4">
              <CheckCircle size={13} />
              Đổi mật khẩu thành công, vui lòng đăng nhập lại
            </div>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-lagoon/30 transition hover:bg-cactus-dim disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Đăng nhập
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-night/40">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-lagoon hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
