import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function PageHeader({ title, description, actions }) {
  useDocumentTitle(title);

  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
