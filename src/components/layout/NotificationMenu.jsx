import { Bell } from "lucide-react";
import { useDismissable } from "../../hooks/useDismissable";
import { IconButton } from "../ui/IconButton";

export function NotificationMenu({ open, onToggle, onClose }) {
  const ref = useDismissable(open, onClose);

  return (
    <div className="relative" ref={ref}>
      <IconButton label="Notifications" aria-expanded={open} aria-controls="notification-panel" onClick={onToggle}>
        <Bell className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      {open ? (
        <div
          id="notification-panel"
          className="absolute right-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-zinc-200 bg-white p-4 shadow-pop dark:border-zinc-700 dark:bg-zinc-900"
        >
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Notifications</p>
          <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">No notifications</p>
          <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
            Leave decisions and new payslips will show up here.
          </p>
        </div>
      ) : null}
    </div>
  );
}
