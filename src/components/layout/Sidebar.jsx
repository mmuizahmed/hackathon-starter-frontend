import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/guide", label: "Guide" },
  { to: "/about", label: "About" },
];

export function Sidebar({ open, onClose }) {
  const asideRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    asideRef.current?.querySelector("a")?.focus();
  }, [open]);

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-stone-900/40 md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside
        id="app-sidebar"
        ref={asideRef}
        className={[
          "w-64 shrink-0 border-stone-200 bg-white md:border-r",
          open
            ? "fixed bottom-0 left-0 top-14 z-40 block border-r md:static md:inset-auto md:z-auto"
            : "hidden md:block",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 md:hidden">
          <p className="text-sm font-medium text-stone-700">Menu</p>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-2 text-sm font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  isActive
                    ? "bg-teal-50 text-teal-950"
                    : "text-stone-700 hover:bg-stone-100",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
