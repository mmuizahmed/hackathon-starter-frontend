import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { focusRing } from "./styles";

const variants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  danger: "bg-red-700 text-white hover:bg-red-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
};

export function Button({
  to,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-control px-3 text-sm font-medium",
    "disabled:cursor-not-allowed disabled:opacity-60",
    focusRing,
    variants[variant] || variants.primary,
    className,
  );

  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
