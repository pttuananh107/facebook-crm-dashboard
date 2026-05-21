"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Login] existing session:", session?.user?.email ?? "none");
      if (session) router.replace("/");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("[Login] attempting login for:", email);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    console.log("[Login] result:", { user: data?.user?.email, error: err?.message });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      console.log("[Login] success, redirecting...");
      router.replace("/");
    }
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
        </div>
      </div>
    </div>
  );
}
