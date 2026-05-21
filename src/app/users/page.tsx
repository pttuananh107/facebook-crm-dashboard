"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth, type UserProfile } from "@/contexts/AuthContext";
import { usePages } from "@/hooks/usePages";
import { Users, Save, Loader2, AlertCircle, CheckCircle, Ban } from "lucide-react";
import clsx from "clsx";

const ROLE_LABELS: Record<UserProfile["role"], string> = {
  super_admin: "super_admin",
  admin: "admin",
  viewer: "viewer",
};

const STATUS_ORDER: Record<UserProfile["status"], number> = {
  pending: 0,
  active: 1,
  disabled: 2,
};

function StatusBadge({ status }: { status: UserProfile["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        Chờ duyệt
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-lagoon/30 bg-lagoon/10 px-2 py-0.5 text-xs font-medium text-lagoon">
        Đang hoạt động
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta/5 px-2 py-0.5 text-xs font-medium text-terracotta">
      Đã tắt
    </span>
  );
}

export default function UsersPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { pages } = usePages();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<UserProfile>>>({});
  // Role to assign when approving a pending user
  const [approveRole, setApproveRole] = useState<Record<string, UserProfile["role"]>>({});

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
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else {
          const sorted = ((data as UserProfile[]) ?? []).sort(
            (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          );
          setUsers(sorted);
        }
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
      setUsers((prev) => {
        const updated = prev.map((u) => (u.id === userId ? { ...u, ...edit } : u));
        return updated.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
    setSaving(null);
  }

  async function approveUser(userId: string) {
    const role = approveRole[userId] ?? "viewer";
    setSaving(userId);
    const { error: err } = await supabase
      .from("user_profiles")
      .update({ status: "active", role } as never)
      .eq("id", userId);
    if (err) {
      alert(err.message);
    } else {
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId ? { ...u, status: "active" as const, role } : u
        );
        return updated.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      });
    }
    setSaving(null);
  }

  async function disableUser(userId: string) {
    setSaving(userId);
    const { error: err } = await supabase
      .from("user_profiles")
      .update({ status: "disabled" } as never)
      .eq("id", userId);
    if (err) {
      alert(err.message);
    } else {
      setUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === userId ? { ...u, status: "disabled" as const } : u
        );
        return updated.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      });
    }
    setSaving(null);
  }

  if (authLoading || !profile || profile.role !== "super_admin") return null;

  return (
    <div className="min-h-screen bg-desert-bg">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
            <Users size={20} className="text-lagoon" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">Quản lý Users</h2>
            <p className="text-sm text-night/50">
              Phân quyền, duyệt và quản lý tài khoản người dùng
            </p>
          </div>
        </div>

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
              <table className="w-full min-w-[800px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-lagoon/20 bg-desert-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Assigned Pages
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-lagoon/70">
                      Hành động
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
                    const isSaving = saving === user.id;
                    const isPending = user.status === "pending";
                    const isActive = user.status === "active";

                    return (
                      <tr
                        key={user.id}
                        className={clsx(
                          "border-b border-lagoon/10",
                          isPending
                            ? "bg-amber-50/40 hover:bg-amber-50/70"
                            : "bg-white hover:bg-desert-surface/50"
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-night/60">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-night">
                          {user.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3">
                          {isPending ? (
                            <select
                              value={approveRole[user.id] ?? "viewer"}
                              onChange={(e) =>
                                setApproveRole((prev) => ({
                                  ...prev,
                                  [user.id]: e.target.value as UserProfile["role"],
                                }))
                              }
                              className="rounded-lg border border-amber-300/60 bg-white px-2 py-1 text-xs text-night outline-none focus:ring-2 focus:ring-lagoon/30"
                            >
                              {(Object.keys(ROLE_LABELS) as UserProfile["role"][]).map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          ) : (
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
                              {(Object.keys(ROLE_LABELS) as UserProfile["role"][]).map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {pages.length === 0 ? (
                              <span className="text-xs text-night/30">Chưa có pages</span>
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
                                        : assigned.filter((id) => id !== page.page_id);
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
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {isPending && (
                              <button
                                onClick={() => approveUser(user.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 rounded-lg border border-lagoon/40 bg-lagoon/10 px-3 py-1.5 text-xs font-medium text-lagoon transition hover:bg-lagoon/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isSaving ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={12} />
                                )}
                                Duyệt
                              </button>
                            )}
                            {isActive && (
                              <button
                                onClick={() => disableUser(user.id)}
                                disabled={isSaving}
                                className="flex items-center gap-1.5 rounded-lg border border-terracotta/30 bg-terracotta/5 px-3 py-1.5 text-xs font-medium text-terracotta transition hover:bg-terracotta/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isSaving ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Ban size={12} />
                                )}
                                Tắt
                              </button>
                            )}
                            {!isPending && (
                              <button
                                onClick={() => saveUser(user.id)}
                                disabled={!hasChanges || isSaving}
                                className={clsx(
                                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                                  hasChanges
                                    ? "border-lagoon/40 bg-lagoon/10 text-lagoon hover:bg-lagoon/20"
                                    : "border-lagoon/20 text-lagoon/30",
                                  "disabled:cursor-not-allowed"
                                )}
                              >
                                {isSaving ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Save size={12} />
                                )}
                                Lưu
                              </button>
                            )}
                          </div>
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
