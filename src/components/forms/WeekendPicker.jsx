import { WEEK_DAYS } from "../../features/setup/payload";
import { cn } from "../../lib/cn";
import { focusRing } from "../ui/styles";

export function WeekendPicker({ value = [], onToggle, error, disabled = false, hint }) {
  return (
    <div>
      <p id="weekend-label" className="mb-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Weekend
      </p>
      <div
        id="weekend"
        role="group"
        aria-labelledby="weekend-label"
        className="grid max-w-md grid-cols-7 gap-1.5"
      >
        {WEEK_DAYS.map((day) => {
          const selected = value.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              className={cn(
                "h-9 rounded-control text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
                focusRing,
                selected
                  ? "border border-brand-700 bg-brand-700 text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
              )}
              onClick={() => onToggle(day.value)}
            >
              {day.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p id="weekend-error" className="mt-1 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{hint || "Saturday and Sunday are off by default."}</p>
      )}
    </div>
  );
}
