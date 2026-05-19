import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
}

const config: Record<Score, { label: string; classes: string; dot: string }> = {
  Hot: {
    label: "Hot",
    classes:
      "bg-terracotta/20 text-terracotta-light border border-terracotta/30 ring-1 ring-terracotta/20",
    dot: "bg-terracotta",
  },
  Warm: {
    label: "Warm",
    classes:
      "bg-desert-gold/20 text-desert-gold border border-desert-gold/30 ring-1 ring-desert-gold/20",
    dot: "bg-desert-gold",
  },
  Cold: {
    label: "Cold",
    classes:
      "bg-cactus/20 text-cactus-light border border-cactus/30 ring-1 ring-cactus/20",
    dot: "bg-cactus",
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
