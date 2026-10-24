import { Card, EmptyState } from "../../../components/ui";

function remainingLabel(item) {
  if (item.remaining == null) return "Unlimited";
  return String(item.remaining);
}

export function LeaveBalanceList({ items = [] }) {
  return (
    <Card title="Leave left">
      {items.length === 0 ? (
        <EmptyState title="No leave balances" message="Balances appear after leave types are set up for the company." />
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((item) => (
            <li key={item.code || item.name} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{item.name || item.code}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {item.pending ? `${item.pending} pending` : "No pending request"}
                  {item.quota != null ? ` · quota ${item.quota}` : ""}
                </p>
              </div>
              <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{remainingLabel(item)} left</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
