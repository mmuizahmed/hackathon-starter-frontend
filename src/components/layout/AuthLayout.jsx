import { Outlet } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[90] focus:rounded-control focus:bg-white focus:px-3 focus:py-2 dark:focus:bg-zinc-900"
      >
        Skip to content
      </a>
      <header className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-brand-700" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">HCM Lite</span>
        </div>
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
