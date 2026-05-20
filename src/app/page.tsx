import { MessageSquare, Zap, Settings } from "lucide-react";
import Link from "next/link";
import { MessageTable } from "@/components/MessageTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-desert-bg">
      {/* Top nav — dark Cactus Night header */}
      <header className="sticky top-0 z-10 border-b border-lagoon/30 bg-night shadow-sm shadow-lagoon/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lagoon">
            <Zap size={16} className="text-night" fill="#052D24" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-white">
              Facebook CRM
            </h1>
            <p className="mt-0.5 text-xs text-white/50">Lead Intelligence Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-lagoon/40 bg-lagoon/20 px-2.5 py-1 text-xs font-medium text-lagoon">
              <span className="h-1.5 w-1.5 rounded-full bg-lagoon animate-pulse" />
              Live
            </span>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-lagoon/40 bg-lagoon/10 px-3 py-1.5 text-xs font-medium text-lagoon transition hover:bg-lagoon/20"
            >
              <Settings size={12} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content — white background */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lagoon/10 border border-lagoon/30">
            <MessageSquare size={20} className="text-lagoon" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-night">Messages</h2>
            <p className="text-sm text-night/50">
              Real-time inbox with Hot / Warm / Cold lead scoring
            </p>
          </div>
        </div>

        <MessageTable />
      </main>
    </div>
  );
}
