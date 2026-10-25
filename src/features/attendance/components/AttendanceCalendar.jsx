import { cn } from "../../../lib/cn";
import { STATUS_LABELS, WEEKDAY_LABELS, calendarCells, indexDays } from "../calendar";

// Cell colors follow the same tones as StatusPill so the month and the board match.
const CELL_TONE = {
  present: "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100",
  late: "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
  half_day: "bg-orange-50 text-orange-950 dark:bg-orange-950/40 dark:text-orange-100",
  absent: "bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100",
  on_leave: "bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100",
  missing_checkout: "bg-yellow-50 text-yellow-950 dark:bg-yellow-950/40 dark:text-yellow-100",
};

function dayNumber(date) {
  return Number(date.slice(8, 10));
}

function DayCell({ date, day, today, selectedDate, onSelectDay }) {
  const status = day?.status || null;
  const label = status ? STATUS_LABELS[status] || status : day?.workingDay === false ? "Off" : "";
  const lateToo = Boolean(day?.late) && status && status !== "late";
  const summary = [date, label || "No mark", lateToo ? "also late" : ""].filter(Boolean).join(", ");
  const className = cn(
    "flex min-h-11 flex-col items-center rounded-control px-1 py-1 text-center sm:min-h-16 sm:items-start sm:px-1.5 sm:text-left",
    status
      ? CELL_TONE[status] || "bg-zinc-50 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
      : "bg-zinc-50 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-500",
    date === selectedDate ? "ring-2 ring-brand-700" : date === today ? "ring-1 ring-brand-700" : "",
  );

  const body = (
    <>
      <span className="text-xs font-medium tabular-nums">{dayNumber(date)}</span>
      {/* Phones show only the colour; the legend and the cell's aria-label carry the words. */}
      {label ? <span className="mt-1 hidden text-[11px] leading-4 sm:block">{label}</span> : null}
      {lateToo ? <span className="hidden text-[11px] leading-4 sm:block">Late</span> : null}
    </>
  );

  if (!onSelectDay) {
    return (
      <div className={className} role="gridcell" aria-label={summary}>
        {body}
      </div>
    );
  }

  return (
    <button type="button" className={className} role="gridcell" aria-label={summary} onClick={() => onSelectDay(day || { date })}>
      {body}
    </button>
  );
}

export function AttendanceCalendar({ month, days = [], today = "", selectedDate = "", onSelectDay }) {
  const byDate = indexDays(days);
  const cells = calendarCells(month);

  return (
    <div>
      <div role="grid" aria-label={`Attendance calendar ${month}`} className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            role="columnheader"
            className="px-1 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
          >
            {label}
          </div>
        ))}
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} role="gridcell" aria-hidden="true" />;
          }
          return (
            <DayCell
              key={date}
              date={date}
              day={byDate.get(date)}
              today={today}
              selectedDate={selectedDate}
              onSelectDay={onSelectDay}
            />
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <li key={status} className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", CELL_TONE[status])}>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
