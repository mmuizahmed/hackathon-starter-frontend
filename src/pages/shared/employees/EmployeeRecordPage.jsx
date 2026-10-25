import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, PageHeader, Spinner } from "../../../components/ui";
import { focusRing } from "../../../components/ui/styles";
import { useToast } from "../../../context/ToastContext";
import { resetFace } from "../../../features/camera/api";
import { getEmployee } from "../../../features/employees/api";
import { messageFrom } from "../../../lib/errors";
import { cn } from "../../../lib/cn";
import { formatDate, formatMonth, formatRupees, titleCase } from "../../../lib/format";
import { EmployeeStatus } from "./EmployeeStatus";

function ProfileLine({ label, value, wide = false }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-zinc-900 dark:text-zinc-100">{value || "—"}</dd>
    </div>
  );
}

function Figure({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">{value ?? 0}</dd>
    </div>
  );
}

export function EmployeeRecordPage({ backTo }) {
  const { id } = useParams();
  const toast = useToast();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

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

  async function onResetFace() {
    if (!employee?.id || resetting) return;
    setResetting(true);
    try {
      const result = await resetFace(employee.id);
      setRecord((current) => ({
        ...current,
        employee: { ...current.employee, faceEnrolled: result?.enrolled === true },
      }));
      setResetOpen(false);
      toast.success("Face signature deleted.");
    } catch (requestError) {
      toast.error(requestError.message || "Could not reset the face signature.");
    } finally {
      setResetting(false);
    }
  }

  const attendance = record?.attendanceThisMonth;
  const balances = record?.leaveBalances;
  const payslip = record?.lastPayslip;

  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className={cn(
          "inline-flex items-center gap-1 rounded-control text-sm font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50",
          focusRing,
        )}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Employees
      </Link>
      <PageHeader
        title={employee?.name || "Employee"}
        description={
          employee
            ? [employee.code, employee.designation?.name, employee.department?.name].filter(Boolean).join(" · ")
            : "Profile, this month's attendance, leave balances, and the last payslip."
        }
        actions={employee ? <EmployeeStatus status={employee.status} /> : null}
      />
      {loading ? <Spinner label="Loading employee" /> : null}
      {error ? <ErrorState title="Could not load this employee" message={error} onRetry={load} /> : null}
      {employee ? (
        <>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card title="Profile">
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <ProfileLine label="Email" value={employee.email} />
                  <ProfileLine label="Phone" value={employee.phone} />
                  <ProfileLine label="Department" value={employee.department?.name} />
                  <ProfileLine label="Designation" value={employee.designation?.name} />
                  <ProfileLine label="Joined" value={formatDate(employee.joinDate)} />
                  {employee.exitDate ? <ProfileLine label="Exit date" value={formatDate(employee.exitDate)} /> : null}
                  <ProfileLine label="Gender" value={employee.gender ? titleCase(employee.gender) : ""} />
                  <ProfileLine label="Basic salary" value={formatRupees(employee.salary?.basic)} />
                  <ProfileLine label="Address" value={employee.address} wide />
                  <ProfileLine
                    label="Face check-in"
                    wide
                    value={
                      <span className="flex flex-wrap items-center gap-3">
                        <Badge tone={employee.faceEnrolled ? "green" : "neutral"}>
                          {employee.faceEnrolled ? "Enrolled" : "Not enrolled"}
                        </Badge>
                        {employee.faceEnrolled ? (
                          <Button variant="secondary" className="h-8" onClick={() => setResetOpen(true)}>
                            Reset face
                          </Button>
                        ) : null}
                      </span>
                    }
                  />
                </dl>
              </Card>
            </div>
            <div className="space-y-4">
              <Card title="Last payslip">
                {payslip ? (
                  <div>
                    <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-zinc-50">
                      {formatRupees(payslip.net)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Net pay · {formatMonth(payslip.month)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No payslip yet. One shows here after payroll runs for this person.</p>
                )}
              </Card>
              <Card title="Leave balances">
                {balances == null ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Balances could not be loaded for this person.</p>
                ) : balances.length === 0 ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Leave balances appear after leave types exist.</p>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {balances.map((row) => (
                      <li key={row.code} className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{row.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {row.used ?? 0} used{row.quota == null ? "" : ` of ${row.quota}`}
                            {row.paid ? "" : " · unpaid"}
                          </p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
                          {row.remaining == null ? "Unlimited" : `${row.remaining} left`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
          <Card title={attendance?.month ? `Attendance · ${formatMonth(attendance.month)}` : "Attendance this month"}>
            {attendance ? (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                <Figure label="Present" value={attendance.present} />
                <Figure label="Late" value={attendance.late} />
                <Figure label="Half day" value={attendance.halfDay} />
                <Figure label="Absent" value={attendance.absent} />
                <Figure label="On leave" value={attendance.onLeave} />
                <Figure label="Missing checkout" value={attendance.missingCheckout} />
                <Figure label="Late arrivals" value={attendance.lateArrivals} />
              </dl>
            ) : (
              <EmptyState title="Attendance is unavailable" message="This month's attendance could not be loaded. The rest of the record is still here." />
            )}
          </Card>
        </>
      ) : null}
      <ConfirmDialog
        open={resetOpen}
        title="Reset face?"
        message="This deletes the stored face signature. The employee will need to enroll again before camera check-in."
        confirmLabel="Reset face"
        tone="danger"
        loading={resetting}
        onConfirm={onResetFace}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
