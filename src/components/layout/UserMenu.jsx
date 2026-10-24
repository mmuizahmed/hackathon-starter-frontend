import { KeyRound, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useDismissable } from "../../hooks/useDismissable";
import { cn } from "../../lib/cn";
import { displayInitials, roleLabel } from "../../lib/user";
import { focusRing } from "../ui/styles";

export function UserMenu({ open, onToggle, onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const ref = useDismissable(open, onClose);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  async function onLogout() {
    setBusy(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Could not log out");
      setBusy(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-control pl-1 pr-2 text-sm font-medium text-zinc-800",
          "hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800",
          focusRing,
        )}
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label={`Account menu for ${user.name || user.email}`}
        onClick={onToggle}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
          {displayInitials(user.name || user.email)}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{user.name || user.email}</span>
      </button>
      {open ? (
        <div
          id="user-menu"
          className="absolute right-0 z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-card border border-zinc-200 bg-white py-1 shadow-pop dark:border-zinc-700 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{user.name || "Account"}</p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
            <p className="mt-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">{roleLabel(user.role)}</p>
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => {
              onClose();
              navigate("/change-password");
            }}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Change password
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-700 disabled:opacity-60 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={onLogout}
            disabled={busy}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {busy ? "Logging out" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
