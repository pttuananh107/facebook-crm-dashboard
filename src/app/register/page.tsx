"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Zap, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      // Dùng API route với service role key để insert profile
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, fullName }),
      });
      if (!res.ok) {
        const { error: apiErr } = await res.json();
        setError(apiErr ?? "Không thể tạo profile");
        setLoading(false);
        return;
      }
    }

    await supabase.auth.signOut();
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-desert-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 p-8 flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
              <CheckCircle size={24} className="text-lagoon" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-night mb-1">Đăng ký thành công!</h2>
              <p className="text-sm text-night/60">
                Tài khoản của bạn đang chờ được phê duyệt.
                Bạn sẽ nhận được thông báo khi được cấp quyền truy cập.
              </p>
            </div>
            <Link href="/login" className="mt-2 text-xs font-medium text-lagoon hover:underline">
              Quay về đăng nhập
            </Link>
          </div>
        </div>
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
          <h2 className="mb-5 text-sm font-semibold text-night">Đăng ký tài khoản</h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Họ và tên</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Nguyễn Văn A"
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-night/60">Xác nhận mật khẩu</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••"
                className="rounded-lg border border-lagoon/50 bg-desert-surface px-3 py-2.5 text-sm text-night outline-none transition focus:ring-2 focus:ring-lagoon/30 placeholder:text-night/30" />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
                <AlertCircle size={13} />{error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-lagoon px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-lagoon/30 transition hover:bg-cactus-dim disabled:opacity-50">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Đăng ký
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-night/50">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-medium text-lagoon hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
