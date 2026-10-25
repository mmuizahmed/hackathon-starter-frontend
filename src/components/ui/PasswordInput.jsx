import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "./Input";

// Password field with a show/hide eye button inside the input.
export function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={`pr-10 ${className}`} />
      {/* The label above the input is 28px tall, so top-7 lines the button up with the field. */}
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-7 flex h-10 w-9 items-center justify-center rounded-control text-zinc-500 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
