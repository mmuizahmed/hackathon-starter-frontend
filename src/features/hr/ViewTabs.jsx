import { cn } from "../../lib/cn";
import { focusRing } from "../../components/ui/styles";

export function ViewTabs({ label, value, options, onChange }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1">
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
              "h-9 rounded-control px-3 text-sm font-medium",
              focusRing,
              selected
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
