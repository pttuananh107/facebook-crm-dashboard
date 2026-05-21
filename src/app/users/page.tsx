"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth, type UserProfile } from "@/contexts/AuthContext";
import { usePages } from "@/hooks/usePages";
import { Users, Save, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

const ROLE_LABELS: Record<UserProfile["role"], string> = {
  super_admin: "super_admin",
  admin: "admin",
  viewer: "viewer",
};

export default function UsersPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { pages } = usePages();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<UserProfile>>>({});

  useEffect(() => {
    if (!authLoading && profile?.role !== "super_admin") {
      router.replace("/");
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (!profile || profile.role !== "super_admin") return;
    supabase
      .from("user_profiles")
      .select("*")
      .order("email")
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setUsers((data as UserProfile[]) ?? []);
        setLoading(false);
      });
  }, [profile]);

  function setEdit<K extends keyof UserProfile>(userId: string, field: K, value: UserProfile[K]) {
    setEdits((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  }

  async function saveUser(userId: string) {
    const edit = edits[userId];
    if (!edit) return;
    setSaving(userId);
    const { error: err } = await supabase
      .from("user_profiles")
      .update(edit as never)
      .eq("id", userId);
    if (err) {
      alert(err.message);
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...edit } : u))
      );
      setEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
    setSaving(null);
  }

  if (authLoading || !profile || profile.role !== "super_admin") return null;

  return (
    <div className="min-h-screen bg-desert-bg">
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
            <Users size={20} className="text-lagoon" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">Quản lý Users</h2>
            <p className="text-sm text-night/50">
              Phân quyền và assign fanpage cho từng user
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-lagoon/30 bg-white shadow-sm shadow-lagoon/10 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-lagoon">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Đang tải...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <AlertCircle size={28} className="text-terracotta" />
              <p className="text-sm text-terracotta">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-lagoon/20 bg-desert-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Assigned Pages
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Lưu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const edit = edits[user.id] ?? {};
                    const role = (edit.role ?? user.role) as UserProfile["role"];
                    const assigned: string[] =
                      edit.assigned_page_ids ?? user.assigned_page_ids ?? [];
                    const hasChanges = !!edits[user.id];

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-lagoon/10 bg-white hover:bg-desert-surface/50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-night/60">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-night">
                          {user.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={role}
                            onChange={(e) =>
                              setEdit(
                                user.id,
                                "role",
                                e.target.value as UserProfile["role"]
                              )
                            }
                            className="rounded-lg border border-lagoon/40 bg-white px-2 py-1 text-xs text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                          >
                            {(
                              Object.keys(ROLE_LABELS) as UserProfile["role"][]
                            ).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {pages.length === 0 ? (
                              <span className="text-xs text-night/30">
                                Chưa có pages
                              </span>
                            ) : (
                              pages.map((page) => (
                                <label
                                  key={page.page_id}
                                  className="flex cursor-pointer items-center gap-1"
                                >
                                  <input
                                    type="checkbox"
                                    checked={assigned.includes(page.page_id)}
                                    onChange={(e) => {
                                      const next = e.target.checked
                                        ? [...assigned, page.page_id]
                                        : assigned.filter(
                                            (id) => id !== page.page_id
                                          );
                                      setEdit(user.id, "assigned_page_ids", next);
                                    }}
                                    className="accent-lagoon"
                                  />
                                  <span className="text-xs text-night/70">
                                    {page.page_name}
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => saveUser(user.id)}
                            disabled={!hasChanges || saving === user.id}
                            className={clsx(
                              "mx-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                              hasChanges
                                ? "border-lagoon/40 bg-lagoon/10 text-lagoon hover:bg-lagoon/20"
                                : "border-lagoon/20 text-lagoon/30",
                              "disabled:cursor-not-allowed"
                            )}
                          >
                            {saving === user.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Save size={12} />
                            )}
                            Lưu
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
