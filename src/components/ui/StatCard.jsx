export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-card border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-zinc-400" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
    </div>
  );
}
