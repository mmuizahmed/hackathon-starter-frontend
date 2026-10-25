import { BrandMark } from "../BrandMark";

// Logo block shown above the card on the sign-in, setup, and change-password screens.
export function AuthBrand() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-3">
        <BrandMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
        <span className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">HCM Lite</span>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">HR Portal</p>
    </div>
  );
}

// Same card on every auth screen so they read as one flow.
export const authCardClass =
  "rounded-xl border border-zinc-200 bg-white p-6 shadow-pop dark:border-zinc-800 dark:bg-zinc-900";
