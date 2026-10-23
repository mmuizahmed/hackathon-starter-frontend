export function Spinner({ label = "Loading" }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-stone-600">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-brand"
      />
      <span>{label}</span>
    </div>
  );
}
