import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
}

const config: Record<Score, { label: string; classes: string; dot: string }> = {
  Hot: {
    label: "Hot",
    classes:
      "bg-red-500/20 text-red-400 border border-red-500/30 ring-1 ring-red-500/20",
    dot: "bg-red-400",
  },
  Warm: {
    label: "Warm",
    classes:
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 ring-1 ring-yellow-500/20",
    dot: "bg-yellow-400",
  },
  Cold: {
    label: "Cold",
    classes:
      "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ring-1 ring-cyan-500/20",
    dot: "bg-cyan-400",
  },
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const { label, classes, dot } = config[score] ?? config.Cold;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        classes
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full animate-pulse-dot", dot)} />
      {label}
    </span>
  );
}
