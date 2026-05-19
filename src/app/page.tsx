import { MessageSquare, Zap } from "lucide-react";
import { MessageTable } from "@/components/MessageTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-white">
              Facebook CRM
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">Lead Intelligence Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
            <MessageSquare size={20} className="text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <p className="text-sm text-slate-400">
              Real-time inbox with Hot / Warm / Cold lead scoring
            </p>
          </div>
        </div>

        <MessageTable />
      </main>
    </div>
  );
}
