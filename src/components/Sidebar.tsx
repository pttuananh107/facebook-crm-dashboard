"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Zap,
  SlidersHorizontal,
  BarChart2,
  Search,
  Settings2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import clsx from "clsx";

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

const MAIN_NAV = [
  {
    icon: MessageSquare,
    label: "Tin nhắn",
    href: "/",
    roles: ["super_admin", "admin", "viewer"] as const,
  },
  {
    icon: Users,
    label: "Khách hàng",
    href: "/users",
    roles: ["super_admin"] as const,
  },
];

const TOOLS_NAV = [
  {
    icon: SlidersHorizontal,
    label: "Bộ lọc",
    href: "/settings/filters",
    roles: ["super_admin", "admin"] as const,
  },
  {
    icon: BarChart2,
    label: "Phân tích",
    href: "/admin",
    roles: ["super_admin", "admin"] as const,
  },
  {
    icon: Settings2,
    label: "Cài đặt",
    href: "/settings/filters",
    roles: ["super_admin", "admin"] as const,
  },
];

function NavItem({
  icon: Icon,
  label,
  href,
  active,
  expanded,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  expanded: boolean;
}) {
  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      className={clsx(
        "relative flex items-center gap-3 rounded-lg py-2 text-sm transition-all duration-150",
        expanded ? "px-3" : "justify-center px-0",
        active
          ? "bg-lagoon/20 text-white"
          : "text-white/50 hover:bg-white/5 hover:text-white/90"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-lagoon" />
      )}
      <Icon size={15} className="shrink-0" />
      {expanded && <span className="truncate font-medium">{label}</span>}
    </Link>
  );
}

export function Sidebar({ expanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  const isVisible = (roles: readonly string[]) =>
    !profile || roles.includes(profile.role);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  const roleLabel =
    profile?.role === "super_admin"
      ? "Super Admin"
      : profile?.role === "admin"
      ? "Admin"
      : "Viewer";

  const roleColor =
    profile?.role === "super_admin"
      ? "text-[#F2B609]"
      : profile?.role === "admin"
      ? "text-lagoon"
      : "text-white/40";

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 z-20 flex h-screen flex-col border-r border-white/[0.08] bg-night transition-all duration-200",
        expanded ? "w-60" : "w-14"
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          "flex items-center border-b border-white/[0.08] px-3 py-4",
          expanded ? "justify-between" : "justify-center"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lagoon shadow-lg shadow-lagoon/30">
            <Zap size={14} className="text-night" fill="#052D24" />
          </div>
          {expanded && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white leading-tight">
                Facebook CRM
              </p>
              <p className="truncate text-[10px] text-white/35 leading-tight mt-0.5">
                Lead Intelligence
              </p>
            </div>
          )}
        </div>
        {expanded && (
          <button
            onClick={onToggle}
            className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/30 transition hover:bg-white/8 hover:text-white/70"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand toggle when collapsed */}
      {!expanded && (
        <div className="flex justify-center pt-3">
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition hover:bg-white/8 hover:text-lagoon"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Search bar */}
      {expanded && (
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-xs text-white/30 transition cursor-pointer hover:border-lagoon/30 hover:text-white/50">
            <Search size={12} className="shrink-0" />
            <span className="flex-1">Tìm kiếm...</span>
            <kbd className="inline-flex items-center rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[9px] text-white/20 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {/* Main Menu */}
        {expanded && (
          <p className="px-2 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">
            Main Menu
          </p>
        )}
        {!expanded && <div className="my-1.5 mx-1 h-px bg-white/[0.08]" />}

        {MAIN_NAV.filter((item) => isVisible(item.roles)).map((item) => (
          <NavItem
            key={item.href + item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={isActive(item.href)}
            expanded={expanded}
          />
        ))}

        {/* Divider */}
        {expanded ? (
          <div className="my-2 mx-1 h-px bg-white/[0.08]" />
        ) : (
          <div className="my-1.5 mx-1 h-px bg-white/[0.08]" />
        )}

        {/* Tools */}
        {expanded && (
          <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/20">
            Tools
          </p>
        )}

        {TOOLS_NAV.filter((item) => isVisible(item.roles)).map((item) => (
          <NavItem
            key={item.href + item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={isActive(item.href)}
            expanded={expanded}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.08] p-2 space-y-1">
        {profile && expanded && (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-white/5 cursor-default">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lagoon/20 text-xs font-bold uppercase text-lagoon ring-2 ring-lagoon/20">
              {(profile.full_name ?? profile.email ?? "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/90 leading-tight">
                {profile.full_name ?? profile.email}
              </p>
              <span
                className={clsx(
                  "text-[10px] font-medium leading-tight",
                  roleColor
                )}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        )}

        {profile && !expanded && (
          <div className="flex justify-center py-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-lagoon/20 text-xs font-bold uppercase text-lagoon ring-2 ring-lagoon/20"
              title={profile.full_name ?? profile.email}
            >
              {(profile.full_name ?? profile.email ?? "U")[0].toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={handleSignOut}
          title="Đăng xuất"
          className={clsx(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-white/35 transition hover:bg-red-500/10 hover:text-red-400",
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
