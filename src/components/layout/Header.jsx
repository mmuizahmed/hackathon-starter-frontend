import { Menu, PanelRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import { homePathForRole } from "../../routes/navigation";
import { IconButton } from "../ui/IconButton";
import { focusRing } from "../ui/styles";
import { NotificationMenu } from "./NotificationMenu";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

export function Header({ menuOpen, onMenuToggle, assistantOpen, onAssistantToggle, menuButtonRef }) {
  const { user } = useAuth();
  const location = useLocation();
  const [panel, setPanel] = useState(null);
  const home = homePathForRole(user?.role) || "/";

  const closePanel = useCallback(() => setPanel(null), []);

  useEffect(() => {
    setPanel(null);
  }, [location.pathname]);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
      <IconButton
        ref={menuButtonRef}
        className="md:hidden"
        label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="app-sidebar"
        onClick={onMenuToggle}
      >
        {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </IconButton>
      <Link
        to={home}
        className={cn("rounded-control text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 md:hidden", focusRing)}
      >
        HCM Lite
      </Link>
      <div className="ml-auto flex items-center gap-1">
        <IconButton
          label={assistantOpen ? "Close assistant" : "Open assistant"}
          aria-pressed={assistantOpen}
          aria-expanded={assistantOpen}
          onClick={onAssistantToggle}
        >
          <PanelRight className="h-4 w-4" aria-hidden="true" />
        </IconButton>
        <NotificationMenu
          open={panel === "notifications"}
          onToggle={() => setPanel((current) => (current === "notifications" ? null : "notifications"))}
          onClose={closePanel}
        />
        <ThemeToggle />
        <UserMenu
          open={panel === "user"}
          onToggle={() => setPanel((current) => (current === "user" ? null : "user"))}
          onClose={closePanel}
        />
      </div>
    </header>
  );
}
