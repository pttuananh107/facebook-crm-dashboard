"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Settings,
  Users,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import clsx from "clsx";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  {
    icon: MessageSquare,
    label: "Messages",
    href: "/",
    roles: ["super_admin", "admin", "viewer"] as const,
  },
  {
    icon: Settings,
    label: "Admin",
    href: "/admin",
    roles: ["super_admin", "admin"] as const,
  },
  {
    icon: Users,
    label: "Users",
    href: "/users",
    roles: ["super_admin"] as const,
  },
];

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !profile || (item.roles as readonly string[]).includes(profile.role)
  );

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-20 flex h-screen flex-col bg-night border-r border-lagoon/20 transition-all duration-200",
        expanded ? "w-48" : "w-14"
      )}
    >
      {/* Header */}
      <div
        className={clsx(
          "flex items-center border-b border-lagoon/20 px-3 py-4",
          expanded ? "justify-between" : "justify-center"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-lagoon">
            <Zap size={13} className="text-night" fill="#052D24" />
          </div>
          {expanded && (
            <span className="truncate text-xs font-bold text-white">
              Facebook CRM
            </span>
          )}
        </div>
        {expanded && (
          <button
            onClick={onToggle}
            className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-lagoon/60 transition hover:bg-lagoon/10 hover:text-lagoon"
          >
            <ChevronRight size={14} className="rotate-180" />
          </button>
        )}
      </div>

      {!expanded && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded text-lagoon/40 transition hover:bg-lagoon/10 hover:text-lagoon"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-2">
        {visibleItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={clsx(
                "flex items-center gap-2.5 rounded-lg py-2 text-sm transition-colors",
                expanded ? "px-2" : "justify-center px-0",
                active
                  ? "border-l-2 border-lagoon bg-lagoon/20 text-white pl-1.5"
                  : "text-white/60 hover:bg-lagoon/10 hover:text-white"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {expanded && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-lagoon/20 p-2">
        {profile && (
          <div
            className={clsx(
              "mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5",
              !expanded && "justify-center"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lagoon/20 text-xs font-bold uppercase text-lagoon">
              {profile.email?.[0] ?? "U"}
            </div>
            {expanded && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {profile.full_name ?? profile.email}
                </p>
                <span
                  className={clsx(
                    "text-[10px] font-medium",
                    profile.role === "super_admin"
                      ? "text-yellow-400"
                      : profile.role === "admin"
                      ? "text-lagoon"
                      : "text-white/50"
                  )}
                >
                  {profile.role === "super_admin" ? "Super Admin" : profile.role === "admin" ? "Admin" : "Viewer"}
                </span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handleSignOut}
          title="Đăng xuất"
          className={clsx(
            "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-white/50 transition hover:bg-terracotta/10 hover:text-terracotta",
            !expanded && "justify-center"
          )}
        >
          <LogOut size={14} className="shrink-0" />
          {expanded && "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
