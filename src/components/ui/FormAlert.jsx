export function FormAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200"
    >
      {message}
    </div>
  );
}
