import { Link } from "react-router-dom";
import { Badge, Card } from "../../../components/ui";
import { formatDate, formatDateRange } from "../../../lib/format";

function pathsFor(role) {
  if (role === "admin") {
    return {
      salary: "/admin/payroll?tab=salary",
      corrections: "/admin/attendance?view=corrections",
      leave: "/admin/leave",
    };
  }
  return {
    salary: "/hr/salary",
    corrections: "/hr/corrections",
    leave: "/hr/leave",
  };
}

function salaryHref(base, employeeId) {
  const join = base.includes("?") ? "&" : "?";
  return `${base}${join}employeeId=${employeeId}`;
}

function Group({ title, href, children }) {
  return (
    <div className="border-t border-zinc-100 py-3 first:border-0 first:pt-0 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{title}</h3>
        <Link to={href} className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-200">
          Open
        </Link>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-200">{children}</ul>
    </div>
  );
}

export function ChecksPanel({ checks, role }) {
  if (!checks) return null;
  const paths = pathsFor(role);

  return (
    <Card
      title="Before finalize"
      actions={checks.ok ? <Badge tone="green">Ready</Badge> : <Badge tone="red">Blocked</Badge>}
    >
      {checks.ok ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          No missing salaries, open check-outs, or pending leave and corrections for this month.
        </p>
      ) : (
        <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
          These have to be cleared, or an admin can lock the month with a written reason.
        </p>
      )}
      {checks.missingSalary?.length ? (
        <Group title="Missing salary" href={paths.salary}>
          {checks.missingSalary.map((person) => (
            <li key={person.employeeId}>
              <Link
                to={salaryHref(paths.salary, person.employeeId)}
                className="hover:underline"
              >
                {person.name} ({person.code})
              </Link>
            </li>
          ))}
        </Group>
      ) : null}
      {checks.missingCheckouts?.length ? (
        <Group title="Missing check-outs" href={paths.corrections}>
          {checks.missingCheckouts.map((row) => (
            <li key={row.attendanceId || `${row.employeeId}-${row.date}`}>
              {row.name || "Employee"} · {formatDate(row.date)}
            </li>
          ))}
        </Group>
      ) : null}
      {checks.pendingLeave?.length ? (
        <Group title="Pending leave" href={paths.leave}>
          {checks.pendingLeave.map((row) => (
            <li key={row.id}>
              {row.name || "Employee"} · {formatDateRange(row.startDate, row.endDate)}
            </li>
          ))}
        </Group>
      ) : null}
      {checks.pendingCorrections?.length ? (
        <Group title="Pending corrections" href={paths.corrections}>
          {checks.pendingCorrections.map((row) => (
            <li key={row.id}>
              {row.name || "Employee"} · {formatDate(row.date)}
            </li>
          ))}
        </Group>
      ) : null}
    </Card>
  );
}
