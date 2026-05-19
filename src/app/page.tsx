import { MessageSquare, Zap } from "lucide-react";
import { MessageTable } from "@/components/MessageTable";

export default function Home() {
  return (
    <div className="min-h-screen bg-desert-bg">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-sage bg-desert-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-desert-gold">
            <Zap size={16} className="text-desert-bg" fill="#1C1F1A" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-desert-text">
              Facebook CRM
            </h1>
            <p className="mt-0.5 text-xs text-desert-text/50">Lead Intelligence Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-cactus/30 bg-cactus/10 px-2.5 py-1 text-xs font-medium text-cactus-light">
              <span className="h-1.5 w-1.5 rounded-full bg-cactus animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-desert-gold/10 border border-desert-gold/20">
            <MessageSquare size={20} className="text-desert-gold" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-desert-text">Messages</h2>
            <p className="text-sm text-desert-text/50">
              Real-time inbox with Hot / Warm / Cold lead scoring
            </p>
          </div>
        </div>

        <MessageTable />
      </main>
    </div>
  );
}
