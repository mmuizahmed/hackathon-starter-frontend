import { Link } from "react-router-dom";

export function Header({ menuOpen, onMenuToggle }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-800 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          onClick={onMenuToggle}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="flex flex-col gap-1">
            <span className="block h-0.5 w-5 bg-stone-800" />
            <span className="block h-0.5 w-5 bg-stone-800" />
            <span className="block h-0.5 w-5 bg-stone-800" />
          </span>
        </button>
        <Link
          to="/"
          className="rounded-sm text-sm font-semibold tracking-tight text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-brand align-middle" />
          Hackathon starter
        </Link>
      </div>
    </header>
  );
}
