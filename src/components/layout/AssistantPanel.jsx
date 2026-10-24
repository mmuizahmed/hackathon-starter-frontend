import { X } from "lucide-react";
import { AssistantChat } from "../../features/assistant/AssistantChat";
import { IconButton } from "../ui/IconButton";

// Kept mounted while closed so the conversation survives closing the panel.
// It is still only React state. Nothing is written to storage.
export function AssistantPanel({ open, onClose }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-zinc-950/40 md:hidden"
          aria-label="Close assistant"
          onClick={onClose}
        />
      ) : null}
      <aside
        aria-label="Assistant"
        hidden={!open}
        className={
          open
            ? "fixed inset-y-0 right-0 z-40 flex w-full max-w-[380px] flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:static md:z-auto md:w-[380px] md:max-w-none"
            : "hidden"
        }
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
        <AssistantChat />
      </aside>
    </>
  );
}
