import { Outlet } from "react-router-dom";
import { AuthBrand } from "./AuthBrand";
import { ThemeToggle } from "./ThemeToggle";

// Setup and change-password share the sign-in look: logo on top, one card centered on the screen.
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[90] focus:rounded-control focus:bg-white focus:px-3 focus:py-2 dark:focus:bg-zinc-900"
      >
        Skip to content
      </a>
      <div className="absolute right-3 top-3">
        <ThemeToggle />
      </div>
      <main id="main" className="w-full max-w-md">
        <AuthBrand />
        <div className="mt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
