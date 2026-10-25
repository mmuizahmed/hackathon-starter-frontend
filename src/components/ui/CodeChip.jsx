// Short machine code such as an audit action name, shown in a monospace chip.
export function CodeChip({ children }) {
  return (
    <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">{children}</code>
  );
}
