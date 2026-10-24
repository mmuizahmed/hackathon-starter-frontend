import { X } from "lucide-react";
import { cn } from "../../lib/cn";

const dots = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-brand-700",
};

export function Toaster({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border border-zinc-200 bg-white px-3 py-3 shadow-pop dark:border-zinc-700 dark:bg-zinc-900"
        >
          <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", dots[toast.tone] || dots.info)} aria-hidden="true" />
          <p className="flex-1 text-sm leading-5 text-zinc-800 dark:text-zinc-100">{toast.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="rounded-control text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:hover:text-zinc-100"
            onClick={() => onDismiss(toast.id)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
