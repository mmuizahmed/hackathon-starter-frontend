import { X } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";
import { IconButton } from "../ui/IconButton";

export function AssistantPanel({ open, onClose }) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-30 bg-zinc-950/40 md:hidden"
        aria-label="Close assistant"
        onClick={onClose}
      />
      <aside
        aria-label="Assistant"
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[380px] flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:static md:z-auto md:w-[380px] md:max-w-none"
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Assistant</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Answers stay inside your role</p>
          </div>
          <IconButton label="Close assistant" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <EmptyState
            title="Not connected yet"
            message="Ask a question once this is connected. Answers come from the same records you can already open."
          />
        </div>
      </aside>
    </>
  );
}
