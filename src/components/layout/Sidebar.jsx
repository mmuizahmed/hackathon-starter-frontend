import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import { roleLabel } from "../../lib/user";
import { roleNavigation } from "../../routes/navigation";
import { IconButton } from "../ui/IconButton";
import { focusRing } from "../ui/styles";

export function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const asideRef = useRef(null);
  const items = user ? roleNavigation[user.role] || [] : [];

  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    asideRef.current?.querySelector("button, a")?.focus();
  }, [open]);

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-zinc-950/40 md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        id="app-sidebar"
        ref={asideRef}
        className={cn(
          "z-40 w-72 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:w-60",
          open ? "fixed inset-y-0 left-0 flex" : "hidden",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="h-2.5 w-2.5 bg-brand-700" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">HCM Lite</span>
          <IconButton className="ml-auto md:hidden" label="Close menu" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {roleLabel(user?.role)}
        </p>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-start gap-2 rounded-control px-2 py-2 text-sm font-medium",
                    focusRing,
                    isActive
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-50",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn("mt-0.5 h-4 w-4 shrink-0", isActive ? "text-brand-700 dark:text-brand-200" : "text-zinc-400")}
                      aria-hidden="true"
                    />
                    <span className="leading-5">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
