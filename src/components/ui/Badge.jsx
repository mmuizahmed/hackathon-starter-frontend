import { cn } from "../../lib/cn";

const tones = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  green: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  orange: "bg-orange-50 text-orange-900 dark:bg-orange-950/50 dark:text-orange-200",
  red: "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  blue: "bg-sky-50 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200",
  yellow: "bg-yellow-50 text-yellow-950 dark:bg-yellow-950/40 dark:text-yellow-200",
};

export function Badge({ tone = "neutral", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}
