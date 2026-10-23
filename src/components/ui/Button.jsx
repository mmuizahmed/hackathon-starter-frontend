import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand",
  secondary:
    "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 focus-visible:ring-brand",
};

export function Button({
  to,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const classes = [
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant] || variants.primary,
    className,
  ].join(" ");

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
