import { Card, EmptyState, ErrorState } from "../../../components/ui";
import { formatDay } from "../../../lib/format";

export function AnnouncementList({ items = [], error, onRetry }) {
  return (
    <Card title="Announcements">
      {error ? (
        <ErrorState title="Could not load announcements" message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState title="No announcements" message="Company posts show up here when Admin or HR publish one." />
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.body}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {item.createdBy?.name || "Company"} · {formatDay(item.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
