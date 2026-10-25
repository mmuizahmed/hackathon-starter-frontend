// The mark sits beside the "HCM Lite" name. The name is the accessible label.
export function BrandMark({ className = "h-7 w-7 shrink-0" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="6" width="14" height="52" rx="4" className="fill-[#1f7a52] dark:fill-[#14532d]" />
      <rect x="40" y="6" width="14" height="52" rx="4" fill="#22c55e" />
      <path
        d="M10 54 C 12 34, 26 30, 40 26 C 47 24, 52 18, 54 8 L 54 20 C 52 32, 42 36, 30 40 C 22 43, 22 50, 22 58 L 14 58 C 11.8 58, 10 56.2, 10 54 Z"
        fill="#ea8a12"
      />
    </svg>
  );
}
