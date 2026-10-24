import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { focusRing } from "./styles";

export const IconButton = forwardRef(function IconButton({ label, className = "", children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-control text-zinc-600",
        "hover:bg-zinc-100 hover:text-zinc-950",
        "dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        focusRing,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
