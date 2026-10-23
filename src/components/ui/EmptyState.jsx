export function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center">
      <p className="font-medium text-stone-800">{title}</p>
      {message ? <p className="mt-1 text-sm text-stone-600">{message}</p> : null}
    </div>
  );
}
