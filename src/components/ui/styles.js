export const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700";

// Only one border color is returned. Tailwind would otherwise keep both and
// the stylesheet order, not the className order, would decide the winner.
export function controlClasses({ error = false, className = "" } = {}) {
  return [
    "h-10 w-full rounded-control border bg-white px-3 text-base text-zinc-950 sm:text-sm",
    "placeholder:text-zinc-400",
    "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500",
    "dark:bg-zinc-950 dark:text-zinc-50 dark:disabled:bg-zinc-900 dark:disabled:text-zinc-500",
    error ? "border-red-600 dark:border-red-500" : "border-zinc-300 dark:border-zinc-700",
    focusRing,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
