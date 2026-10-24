import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading" }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <Loader2 className="h-4 w-4 animate-spin text-brand-700" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
