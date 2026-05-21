import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
  reasons?: string[];
}

const config: Record<Score, { label: string; classes: string; dot: string }> = {
  Hot: {
    label: "Hot",
    classes: "bg-lagoon text-night border border-lagoon/30",
    dot: "bg-night/60",
  },
  Warm: {
    label: "Warm",
    classes: "bg-desert-gold text-night border border-desert-gold/50",
    dot: "bg-night/60",
  },
  Cold: {
    label: "Cold",
    classes: "bg-cactus-pale text-night border border-lagoon",
    dot: "bg-lagoon",
  },
};

export function ScoreBadge({ score, reasons }: ScoreBadgeProps) {
  const { label, classes, dot } = config[score] ?? config.Cold;
  const hasReasons = reasons && reasons.length > 0;

  return (
    <span className="relative inline-flex group/badge">
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
          hasReasons && "cursor-help",
          classes
        )}
      >
        <span className={clsx("h-1.5 w-1.5 rounded-full animate-pulse-dot", dot)} />
        {label}
      </span>

      {hasReasons && (
        <div
          className={clsx(
            "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2",
            "rounded-lg border border-[#0a3d2e]/30 bg-[#052D24] px-3 py-2 shadow-lg",
            "opacity-0 transition-opacity duration-150 group-hover/badge:opacity-100"
          )}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Lý do
          </p>
          <ul className="flex flex-col gap-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/90">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-lagoon" />
                {r}
              </li>
            ))}
          </ul>
          {/* Arrow */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#052D24]" />
        </div>
      )}
    </span>
  );
}
