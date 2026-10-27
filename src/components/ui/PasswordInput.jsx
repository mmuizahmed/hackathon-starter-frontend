import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./Input";

// Password field with a show/hide eye button inside the input.
export function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  const toggle = (
    <button
      type="button"
      onClick={() => setVisible((value) => !value)}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="flex h-9 w-9 items-center justify-center rounded-control text-zinc-500 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  );

  return <Input {...props} type={visible ? "text" : "password"} className={`pr-11 ${className}`} trailing={toggle} />;
}
