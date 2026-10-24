import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AssistantPanel } from "./AssistantPanel";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (!mobile || (!menuOpen && !assistantOpen)) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen, assistantOpen]);

  function closeMenu() {
    setMenuOpen(false);
    const button = menuButtonRef.current;
    if (button && button.offsetParent !== null) button.focus();
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[90] focus:rounded-control focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop dark:focus:bg-zinc-900"
      >
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={closeMenu} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          menuOpen={menuOpen}
          onMenuToggle={() => {
            setAssistantOpen(false);
            setMenuOpen((open) => !open);
          }}
          assistantOpen={assistantOpen}
          onAssistantToggle={() => {
            setMenuOpen(false);
            setAssistantOpen((open) => !open);
          }}
          menuButtonRef={menuButtonRef}
        />
        <div className="flex min-h-0 flex-1">
          <main id="main" className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
          <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
        </div>
      </div>
    </div>
  );
}
