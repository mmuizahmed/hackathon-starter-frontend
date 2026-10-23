export function Card({ title, actions, children }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      {title || actions ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title ? (
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          ) : (
            <span />
          )}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
