import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton, StatusPill } from "../../../components/ui";
import { monthLabel, weekdayIndex } from "../../../lib/format";

// The shared AttendanceCalendar was not on main, so this month grid lives with
// the employee screen. Props are the month key and the days returned by the API.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CELL = {
  present: "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100",
  late: "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
  half_day: "bg-orange-50 text-orange-950 dark:bg-orange-950/40 dark:text-orange-100",
  absent: "bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100",
  on_leave: "bg-sky-50 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100",
  missing_checkout: "bg-yellow-50 text-yellow-950 dark:bg-yellow-950/40 dark:text-yellow-100",
};

const LEGEND = [
  ["present", "Present"],
  ["late", "Late"],
  ["half_day", "Half day"],
  ["absent", "Absent"],
  ["on_leave", "On leave"],
  ["missing_checkout", "Missing checkout"],
];

export function MonthCalendar({ month, days = [], selectedDate, today, onSelect, onMonthChange }) {
  const lead = days[0]?.date ? weekdayIndex(days[0].date) : 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <IconButton label="Previous month" onClick={() => onMonthChange(-1)}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </IconButton>
        <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{monthLabel(month)}</p>
        <IconButton label="Next month" onClick={() => onMonthChange(1)}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:text-xs">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, index) => (
          <div key={`pad-${index}`} />
        ))}
        {days.map((day) => {
          const selected = day.date === selectedDate;
          const tone = CELL[day.status] || "bg-zinc-50 text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300";
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={selected}
              aria-label={`${day.date}${day.status ? `, ${day.status}` : ""}`}
              className={`flex h-10 flex-col items-center justify-center rounded-control text-sm sm:h-14 ${tone} ${
                selected ? "ring-2 ring-brand-700" : ""
              } ${day.date === today ? "font-semibold" : ""}`}
            >
              {Number(day.date.slice(8))}
            </button>
          );
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {LEGEND.map(([status]) => (
          <li key={status}>
            <StatusPill status={status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
