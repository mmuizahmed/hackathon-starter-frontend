import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

function cellAlign(column) {
  return column.align === "right" ? "text-right" : "text-left";
}

function cellValue(column, row) {
  return column.render ? column.render(row) : row?.[column.key];
}

// Phones get one small card per row instead of a table that scrolls sideways.
// The first column is the card title. Row actions (no header, or "Actions") sit at the bottom.
function MobileRows({ columns, rows, rowKey }) {
  const [first, ...rest] = columns;
  const isAction = (column) => !column.header || column.header === "Actions";
  const fields = rest.filter((column) => !isAction(column));
  const actions = rest.filter(isAction);

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {rows.map((row, index) => (
        <li key={row?.[rowKey] ?? index} className="space-y-2 px-4 py-3">
          <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{cellValue(first, row)}</div>
          {fields.length > 0 ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {fields.map((column) => (
                <div key={column.key} className="min-w-0">
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">{column.header}</dt>
                  <dd className="mt-0.5 break-words text-zinc-800 dark:text-zinc-200">{cellValue(column, row)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {actions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((column) => (
                <div key={column.key}>{cellValue(column, row)}</div>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
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
  minWidth = "36rem",
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
        <>
        {!loading && rows.length > 0 ? (
          <div className="sm:hidden">
            <MobileRows columns={columns} rows={rows} rowKey={rowKey} />
          </div>
        ) : null}
        <div className={`overflow-x-auto ${!loading && rows.length > 0 ? "hidden sm:block" : ""}`}>
          <table className="w-full border-collapse text-left text-sm" style={{ minWidth }} aria-busy={loading || undefined}>
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
                            {cellValue(column, row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
        </>
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
