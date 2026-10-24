import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button, EmptyState, ErrorState } from "../ui";
import { useDismissable } from "../../hooks/useDismissable";
import { formatDateTime } from "../../lib/format";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../features/notifications/api";
import { IconButton } from "../ui/IconButton";

const POLL_MS = 60000;

export function NotificationMenu({ open, onToggle, onClose }) {
  const ref = useDismissable(open, onClose);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const refreshCount = useCallback(async (signal) => {
    try {
      const data = await getUnreadCount({ signal });
      setCount(data?.count || 0);
    } catch (requestError) {
      if (requestError?.name === "AbortError") return;
      // Keep the last count. A failed poll should not clear a real badge.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refreshCount(controller.signal);
    const timer = window.setInterval(() => refreshCount(), POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    listNotifications({ limit: 20 }, { signal: controller.signal })
      .then((data) => {
        if (!active) return;
        setItems(data?.items || []);
        setCount(data?.unreadCount || 0);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [open]);

  async function markOne(item) {
    if (item.read || acting) return;
    setActing(true);
    try {
      await markNotificationRead(item.id);
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, read: true } : row)));
      setCount((current) => Math.max(0, current - 1));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActing(false);
    }
  }

  async function markAll() {
    if (acting) return;
    setActing(true);
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((row) => ({ ...row, read: true })));
      setCount(0);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActing(false);
    }
  }

  const label = count > 0 ? `Notifications, ${count} unread` : "Notifications";

  return (
    <div className="relative" ref={ref}>
      <IconButton label={label} aria-expanded={open} aria-controls="notification-panel" onClick={onToggle}>
        <Bell className="h-4 w-4" aria-hidden="true" />
      </IconButton>
      {count > 0 ? (
        <span className="pointer-events-none absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-medium leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
      {open ? (
        <div
          id="notification-panel"
          className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-zinc-200 bg-white shadow-pop dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Notifications</p>
            <Button variant="ghost" onClick={markAll} disabled={count === 0 || acting}>
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto p-3">
            {loading ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading notifications</p> : null}
            {error ? <ErrorState title="Could not load notifications" message={error} /> : null}
            {!loading && !error && items.length === 0 ? (
              <EmptyState title="No notifications" message="Leave decisions and new payslips show up here." />
            ) : null}
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="w-full rounded-control px-2 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => markOne(item)}
                  >
                    <span className="flex items-start gap-2">
                      {item.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-transparent" /> : <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-700" />}
                      <span className="min-w-0">
                        <span className={`block text-sm ${item.read ? "text-zinc-600 dark:text-zinc-300" : "font-medium text-zinc-950 dark:text-zinc-50"}`}>
                          {item.title}
                        </span>
                        {item.body ? <span className="mt-0.5 block text-sm leading-5 text-zinc-500 dark:text-zinc-400">{item.body}</span> : null}
                        <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">{formatDateTime(item.createdAt)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
