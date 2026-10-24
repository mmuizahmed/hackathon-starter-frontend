import { Card, EmptyState, StatusPill } from "../../../components/ui";
import { formatDay, formatTime, titleCase } from "../../../lib/format";

export function DayDetail({ day }) {
  if (!day) {
    return (
      <Card title="Day">
        <EmptyState title="Select a day" message="Choose a date on the calendar to see the status and times." />
      </Card>
    );
  }

  return (
    <Card title={formatDay(day.date)}>
      <div className="flex flex-wrap items-center gap-2">
        {day.status ? <StatusPill status={day.status} /> : <p className="text-sm text-zinc-500">No status</p>}
        {day.late && day.status !== "late" ? <StatusPill status="late" /> : null}
      </div>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Working day</dt>
          <dd className="text-zinc-950 dark:text-zinc-50">{day.workingDay ? "Yes" : "No"}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Check in</dt>
          <dd className="text-zinc-950 dark:text-zinc-50">{formatTime(day.checkIn)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Check out</dt>
          <dd className="text-zinc-950 dark:text-zinc-50">{formatTime(day.checkOut)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500 dark:text-zinc-400">Source</dt>
          <dd className="text-zinc-950 dark:text-zinc-50">{day.source ? titleCase(day.source) : "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}
