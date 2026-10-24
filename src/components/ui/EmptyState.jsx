import { Inbox } from "lucide-react";

export function EmptyState({ title, message, icon: Icon = Inbox }) {
  return (
    <div className="rounded-card border border-dashed border-zinc-300 bg-white px-4 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-control bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
      {message ? (
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">{message}</p>
      ) : null}
    </div>
  );
}
