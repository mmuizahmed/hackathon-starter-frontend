import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, DataTable, ErrorState, IconButton, Input, StatusPill } from "../../../components/ui";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { formatClock, formatDate, formatHours, formatMonth, hoursBetween, sourceLabel, todayInKarachi } from "../../../lib/format";
import { getAttendanceCalendar } from "../api";
import { shiftMonth } from "../calendar";
import { AttendanceCalendar } from "./AttendanceCalendar";

function markedDays(days) {
  return (days || []).filter((day) => day.status || day.checkIn);
}

export function EmployeeMonth({ employee, month, onMonthChange, onBack }) {
  const load = useCallback(
    (signal) => getAttendanceCalendar({ month, employeeId: employee.employeeId }, { signal }),
    [month, employee.employeeId],
  );
  const { data, error, loading, reload } = useAbortableRequest(load);
  const days = data?.days || [];
  const rows = markedDays(days);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Button variant="ghost" onClick={onBack}>
            Back to board
          </Button>
          <h2 className="mt-1 text-base font-semibold text-zinc-950 dark:text-zinc-50">
            {employee.name}
            <span className="ml-2 text-sm font-normal text-zinc-500">{employee.code}</span>
          </h2>
          {employee.department?.name ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{employee.department.name}</p>
          ) : null}
        </div>
        <div className="flex items-end gap-2">
          <IconButton label="Previous month" onClick={() => onMonthChange(shiftMonth(month, -1))}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </IconButton>
          <div className="w-40">
            <Input
              name="month"
              label="Month"
              type="month"
              value={month}
              onChange={(event) => {
                if (event.target.value) onMonthChange(event.target.value);
              }}
            />
          </div>
          <IconButton label="Next month" onClick={() => onMonthChange(shiftMonth(month, 1))}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {error && !loading ? (
        <ErrorState title="Could not load the calendar" message={error} onRetry={reload} />
      ) : (
        <div className="rounded-card border border-zinc-200 bg-white p-3 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{formatMonth(data?.month || month)}</p>
          {loading ? (
            <div className="grid grid-cols-7 gap-1" aria-hidden="true">
              {Array.from({ length: 35 }, (_, index) => (
                <span key={index} className="block h-16 animate-pulse rounded-control bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : (
            <AttendanceCalendar month={data?.month || month} days={days} today={todayInKarachi()} />
          )}
          {loading ? <span className="sr-only">Loading calendar</span> : null}
        </div>
      )}

      <DataTable
        caption={`${employee.name} attendance in ${formatMonth(month)}`}
        columns={[
          { key: "date", header: "Date", render: (row) => formatDate(row.date) },
          {
            key: "status",
            header: "Status",
            render: (row) => (row.status ? <StatusPill status={row.status} /> : "—"),
          },
          { key: "checkIn", header: "Check in", render: (row) => formatClock(row.checkIn, row.date) },
          { key: "checkOut", header: "Check out", render: (row) => formatClock(row.checkOut, row.date) },
          {
            key: "hours",
            header: "Hours",
            align: "right",
            render: (row) => formatHours(hoursBetween(row.checkIn, row.checkOut)),
          },
          { key: "source", header: "Source", render: (row) => sourceLabel(row.source) },
        ]}
        rows={loading ? [] : rows}
        rowKey="date"
        loading={loading}
        emptyTitle="No attendance marks this month"
        emptyMessage="Weekends and days still ahead stay blank. A mark appears after a check-in, leave, or an absence."
      />
    </div>
  );
}
