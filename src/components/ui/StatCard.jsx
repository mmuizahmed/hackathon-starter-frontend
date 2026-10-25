export function StatCard({ label, value, hint, icon: Icon, className = "" }) {
  return (
    <div className={`min-w-0 rounded-card border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-200" aria-hidden="true" /> : null}
      </div>
      {/* Smaller on phones so long rupee amounts fit a half-width card. */}
      <p className="mt-2 break-words text-xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}
