import { type Score } from "@/lib/supabase";
import clsx from "clsx";

interface ScoreBadgeProps {
  score: Score;
}

const config: Record<Score, { label: string; classes: string; dot: string }> = {
  Hot: {
    label: "Hot",
    // Lagoon Bloom solid — #26C0BD bg, Cactus Night text
    classes: "bg-lagoon text-night border border-lagoon/30",
    dot: "bg-night/60",
  },
  Warm: {
    label: "Warm",
    // Desert Glow solid — #F2B609 bg, Cactus Night text
    classes: "bg-desert-gold text-night border border-desert-gold/50",
    dot: "bg-night/60",
  },
  Cold: {
    label: "Cold",
    // Cactus pale bg — #E8F5F5 bg, Cactus Night text, Lagoon Bloom border
    classes: "bg-cactus-pale text-night border border-lagoon",
    dot: "bg-lagoon",
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
