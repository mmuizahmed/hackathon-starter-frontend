import { useCallback, useState } from "react";
import { Button, DataTable, DatePicker, Select, StatCard, StatusPill } from "../../../components/ui";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { formatClock, formatHours, hoursBetween, sourceLabel, todayInKarachi } from "../../../lib/format";
import { getAttendanceBoard, listDepartments } from "../api";
import { BOARD_STATUSES, countByStatus } from "../calendar";
import { EmployeeMonth } from "./EmployeeMonth";

function departmentOptions(items) {
  return (items || []).map((department) => ({ value: department.id, label: department.name }));
}

function StatusCell({ row }) {
  if (!row.status) return <span className="text-zinc-400">—</span>;
  const alsoLate = row.late && row.status !== "late";
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <StatusPill status={row.status} />
      {alsoLate ? <StatusPill status="late" /> : null}
    </span>
  );
}

export function AttendanceBoard() {
  const [date, setDate] = useState(todayInKarachi);
  const [departmentId, setDepartmentId] = useState("");
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(date.slice(0, 7));

  const loadDepartments = useCallback((signal) => listDepartments({ signal }), []);
  const departments = useAbortableRequest(loadDepartments);

  const loadBoard = useCallback(
    (signal) => getAttendanceBoard({ date, departmentId }, { signal }),
    [date, departmentId],
  );
  const board = useAbortableRequest(loadBoard);
  const items = board.data?.items || [];
  const counts = countByStatus(items);

  function openEmployee(row) {
    setSelected(row);
    setMonth(date.slice(0, 7));
  }

  if (selected) {
    return (
      <EmployeeMonth
        employee={selected}
        month={month}
        onMonthChange={setMonth}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
        <div className="min-w-0 sm:w-44">
          <DatePicker name="boardDate" label="Date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="min-w-0 sm:w-56">
          <Select
            name="departmentId"
            label="Department"
            placeholder="All departments"
            value={departmentId}
            options={departmentOptions(departments.data?.items)}
            onChange={(event) => setDepartmentId(event.target.value)}
          />
        </div>
        {departmentId ? (
          <Button variant="secondary" onClick={() => setDepartmentId("")}>
            Clear
          </Button>
        ) : null}
      </div>
      {departments.error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{departments.error}</p>
      ) : null}
      {board.data && !board.loading && board.data.workingDay === false ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This date is a weekend or a holiday. People are not marked absent for it.
        </p>
      ) : null}

      {!board.loading && !board.error && items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {BOARD_STATUSES.map((item) => (
            <StatCard key={item.status} label={item.label} value={counts[item.status]} />
          ))}
        </div>
      ) : null}

      <DataTable
        caption="Daily attendance"
        columns={[
          {
            key: "name",
            header: "Employee",
            render: (row) => (
              <button
                type="button"
                className="text-left font-medium text-zinc-950 underline-offset-2 hover:underline dark:text-zinc-50"
                onClick={() => openEmployee(row)}
              >
                {row.name}
                <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                  {row.code}
                  {row.department?.name ? ` · ${row.department.name}` : ""}
                </span>
              </button>
            ),
          },
          { key: "status", header: "Status", render: (row) => <StatusCell row={row} /> },
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
        rows={board.loading ? [] : items}
        rowKey="employeeId"
        loading={board.loading}
        error={board.error}
        onRetry={board.reload}
        emptyTitle="No one is employed on this date"
        emptyMessage="The board lists people who had joined by this date and had not left yet."
      />
    </div>
  );
}
