import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

function cellAlign(column) {
  return column.align === "right" ? "text-right" : "text-left";
}

export function DataTable({
  columns,
  rows = [],
  rowKey = "id",
  page = 1,
  limit = 10,
  total = 0,
  onPageChange,
  loading = false,
  error = "",
  onRetry,
  emptyTitle = "No records",
  emptyMessage = "Nothing matches this view.",
  caption = "Records",
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const showPager = typeof onPageChange === "function" && total > 0;

  return (
    <div className="overflow-hidden rounded-card border border-zinc-200 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      {error && !loading ? (
        <div className="p-4">
          <ErrorState title="Could not load records" message={error} onRetry={onRetry} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm" aria-busy={loading || undefined}>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 ${cellAlign(column)}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={`loading-${index}`} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      {columns.map((column) => (
                        <td key={column.key} className="px-3 py-2">
                          <span className="block h-3 w-24 animate-pulse rounded-control bg-zinc-100 dark:bg-zinc-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-4">
                    <EmptyState title={emptyTitle} message={emptyMessage} />
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length > 0
                ? rows.map((row, index) => {
                    const key = row?.[rowKey] ?? index;
                    return (
                      <tr key={key} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={`px-3 py-2 text-zinc-800 dark:text-zinc-200 ${column.wrap ? "whitespace-normal" : "whitespace-nowrap"} ${cellAlign(column)}`}
                          >
                            {column.render ? column.render(row) : row?.[column.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      )}

      {showPager ? (
        <div className="flex flex-col gap-2 border-t border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {from}–{to} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button variant="secondary" disabled={page * limit >= total} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? <span className="sr-only">Loading rows</span> : null}
    </div>
  );
}
