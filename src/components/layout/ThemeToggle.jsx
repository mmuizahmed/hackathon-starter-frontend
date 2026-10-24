import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { IconButton } from "../ui/IconButton";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <IconButton label={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={isDark} onClick={toggleTheme}>
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </IconButton>
  );
}
