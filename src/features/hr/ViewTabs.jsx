import { cn } from "../../lib/cn";
import { focusRing } from "../../components/ui/styles";

export function ViewTabs({ label, value, options, onChange }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-control bg-zinc-100 p-1 dark:bg-zinc-800/70">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 rounded-[4px] px-3 text-sm font-medium",
              focusRing,
              selected
                ? "bg-white text-zinc-950 shadow-card dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
