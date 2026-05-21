import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
  reasons?: string[];
}

const config: Record<
  Score,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  Hot: {
    label: "Hot",
    bg: "rgba(242, 182, 9, 0.12)",
    text: "#F2B609",
    dot: "#F2B609",
    border: "rgba(242, 182, 9, 0.35)",
  },
  Warm: {
    label: "Warm",
    bg: "rgba(64, 186, 133, 0.12)",
    text: "#40BA85",
    dot: "#40BA85",
    border: "rgba(64, 186, 133, 0.35)",
  },
  Cold: {
    label: "Cold",
    bg: "rgba(90, 122, 106, 0.1)",
    text: "#5A7A6A",
    dot: "#5A7A6A",
    border: "rgba(90, 122, 106, 0.3)",
  },
};

export function ScoreBadge({ score, reasons }: ScoreBadgeProps) {
  const { label, bg, text, dot, border } = config[score] ?? config.Cold;
  const hasReasons = reasons && reasons.length > 0;

  return (
    <span className="relative inline-flex group/badge">
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
          hasReasons && "cursor-help"
        )}
        style={{ background: bg, color: text, border: `1px solid ${border}` }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse-dot"
          style={{ background: dot }}
        />
        {label}
      </span>

      {hasReasons && (
        <div
          className={clsx(
            "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[220px] -translate-x-1/2",
            "rounded-lg border border-white/10 bg-[#062e25] px-3 py-2 shadow-xl shadow-black/40",
            "opacity-0 transition-opacity duration-150 group-hover/badge:opacity-100"
          )}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Lý do
          </p>
          <ul className="flex flex-col gap-0.5">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/80">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-lagoon" />
                {r}
              </li>
            ))}
          </ul>
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#062e25]" />
        </div>
      )}
    </span>
  );
}
