import { Card } from "../../../components/ui";
import { formatHours } from "../../../lib/format";

export function WeekHours({ hours = 0, expected = 40 }) {
  const goal = expected || 40;
  const width = Math.max(0, Math.min(100, goal === 0 ? 0 : (Number(hours) / goal) * 100));

  return (
    <Card title="Hours this week">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50">
        {formatHours(hours)}
        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">of {goal} h</span>
      </p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        role="progressbar"
        aria-label="Hours this week"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Number(hours) || 0}
      >
        <div className="h-full bg-brand-700" style={{ width: `${width}%` }} />
      </div>
    </Card>
  );
}
