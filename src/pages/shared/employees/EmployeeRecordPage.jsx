import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, DataTable, EmptyState, ErrorState, PageHeader, Spinner, StatCard } from "../../../components/ui";
import { getEmployee } from "../../../features/employees/api";
import { messageFrom } from "../../../lib/errors";
import { formatDate, formatMoney } from "../../../lib/format";
import { EmployeeStatus } from "./EmployeeStatus";

function ProfileLine({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-zinc-100 py-2 text-sm last:border-0 sm:grid-cols-3 dark:border-zinc-800">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="sm:col-span-2 text-zinc-900 dark:text-zinc-100">{value || "—"}</dd>
    </div>
  );
}

export function EmployeeRecordPage({ backTo }) {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    getEmployee(id, { signal: controller.signal })
      .then((data) => setRecord(data))
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(messageFrom(err, "Could not load this employee."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  useEffect(() => load(), [load]);

  const employee = record?.employee;
  const attendance = record?.attendanceThisMonth;
  const balances = record?.leaveBalances;
  const payslip = record?.lastPayslip;

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee?.name || "Employee"}
        description={employee ? `${employee.code} · ${employee.email}` : "Profile, this month's attendance, leave balances, and the last payslip."}
        actions={<Button variant="secondary" to={backTo}>Back to directory</Button>}
      />
      {loading ? <Spinner label="Loading employee" /> : null}
      {error ? <ErrorState title="Could not load this employee" message={error} onRetry={load} /> : null}
      {employee ? (
        <>
          <Card title="Profile">
            <dl>
              <ProfileLine label="Status" value={<EmployeeStatus status={employee.status} />} />
              <ProfileLine label="Department" value={employee.department?.name} />
              <ProfileLine label="Designation" value={employee.designation?.name} />
              <ProfileLine label="Joined" value={formatDate(employee.joinDate)} />
              <ProfileLine label="Exit date" value={employee.exitDate ? formatDate(employee.exitDate) : "—"} />
              <ProfileLine label="Phone" value={employee.phone} />
              <ProfileLine label="Address" value={employee.address} />
              <ProfileLine label="Gender" value={employee.gender} />
              <ProfileLine label="Basic salary" value={formatMoney(employee.salary?.basic)} />
            </dl>
          </Card>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Attendance this month</h2>
            {attendance ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Month" value={attendance.month || "—"} />
                <StatCard label="Present" value={attendance.present ?? 0} />
                <StatCard label="Late" value={attendance.late ?? 0} />
                <StatCard label="Half day" value={attendance.halfDay ?? 0} />
                <StatCard label="Absent" value={attendance.absent ?? 0} />
                <StatCard label="On leave" value={attendance.onLeave ?? 0} />
                <StatCard label="Missing checkout" value={attendance.missingCheckout ?? 0} />
                <StatCard label="Late arrivals" value={attendance.lateArrivals ?? 0} />
              </div>
            ) : (
              <EmptyState title="Attendance is unavailable" message="This month's attendance could not be loaded. The rest of the record is still here." />
            )}
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Leave balances</h2>
            {balances == null ? (
              <EmptyState title="Leave balances are unavailable" message="Balances could not be loaded for this person." />
            ) : (
              <DataTable
                columns={[
                  { key: "code", header: "Code" },
                  { key: "name", header: "Type" },
                  { key: "paid", header: "Paid", render: (row) => (row.paid ? "Paid" : "Unpaid") },
                  { key: "quota", header: "Quota", render: (row) => (row.quota == null ? "Unlimited" : row.quota) },
                  { key: "used", header: "Used" },
                  { key: "remaining", header: "Remaining", render: (row) => (row.remaining == null ? "Unlimited" : row.remaining) },
                ]}
                rows={balances.map((row) => ({ ...row, id: row.code }))}
                total={balances.length}
                caption="Leave balances"
                emptyTitle="No leave types"
                emptyMessage="Leave balances appear after leave types exist."
              />
            )}
          </section>
          <Card title="Last payslip">
            {payslip ? (
              <p className="text-sm text-zinc-800 dark:text-zinc-100">
                {payslip.month} · net {formatMoney(payslip.net)}
              </p>
            ) : (
              <EmptyState title="No payslip yet" message="A payslip shows up here after payroll is run for this person." />
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
