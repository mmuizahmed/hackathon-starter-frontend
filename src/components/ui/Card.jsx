export function Card({ title, actions, children }) {
  return (
    <section className="rounded-card border border-zinc-200 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      {title || actions ? (
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
          {title ? (
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
          ) : (
            <span />
          )}
          {actions}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
