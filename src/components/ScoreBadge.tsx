import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
}

const config: Record<Score, { label: string; classes: string; dot: string }> = {
  Hot: {
    label: "Hot",
    // Desert Glow — #F2B609
    classes:
      "bg-desert-gold/20 text-desert-gold border border-desert-gold/50 ring-1 ring-desert-gold/20",
    dot: "bg-desert-gold",
  },
  Warm: {
    label: "Warm",
    // Cactus Vein — #40BA85
    classes:
      "bg-cactus/20 text-cactus border border-cactus/50 ring-1 ring-cactus/20",
    dot: "bg-cactus",
  },
  Cold: {
    label: "Cold",
    // Cactus Night bg — #052D24 with Cactus Vein border — #40BA85
    classes:
      "bg-night text-cactus border border-cactus ring-1 ring-cactus/30",
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
