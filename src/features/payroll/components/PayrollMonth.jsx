import { useCallback, useState } from "react";
import { Badge, Button, ConfirmDialog, DataTable, EmptyState, ErrorState, FormAlert, Modal, Spinner, StatCard, Textarea } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { formatDays, formatMoney, formatMonth } from "../../../lib/format";
import { downloadPayslipPdf, finalizePayrollRun, generatePayrollRun, getPayrollChecks, getPayrollRun, listPayrollRuns } from "../api";
import { paidDayCount } from "../salaryMath";
import { ChecksPanel } from "./ChecksPanel";
import { PayslipDrawer } from "./PayslipDrawer";

export function PayrollMonth({ role, month, canGenerate, canFinalize }) {
  const toast = useToast();
  const [confirmGenerate, setConfirmGenerate] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [actionError, setActionError] = useState("");
  const [acting, setActing] = useState(false);
  const [slip, setSlip] = useState(null);
  const [downloadingId, setDownloadingId] = useState("");

  const load = useCallback(
    async (signal) => {
      const list = await listPayrollRuns({ limit: 100 }, { signal });
      const match = (list?.items || []).find((run) => run.month === month) || null;
      if (!match) return { run: null, checks: null };
      const [run, checks] = await Promise.all([
        getPayrollRun(match.id, { signal }),
        getPayrollChecks(match.id, { signal }),
      ]);
      return { run, checks };
    },
    [month],
  );
  const { data, error, loading, reload } = useAbortableRequest(load);
  // Keep the open month on screen during a refresh. Hide it when the selector moved on.
  const stale = Boolean(data?.run && data.run.month !== month);
  const run = stale ? null : data?.run || null;
  const checks = stale ? null : data?.checks || null;
  const locked = run?.status === "finalized";
  const payslips = [...(run?.payslips || [])].sort((a, b) =>
    (a.employeeName || "").localeCompare(b.employeeName || ""),
  );
  const openSlip = slip && slip.month === month ? slip : null;

  async function generate() {
    setActing(true);
    setActionError("");
    try {
      await generatePayrollRun(month);
      toast.success(run ? `Regenerated the ${formatMonth(month)} draft.` : `Draft created for ${formatMonth(month)}.`);
      setConfirmGenerate(false);
      reload();
    } catch (requestError) {
      setActionError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setActing(false);
    }
  }

  async function finalize(body) {
    if (!run) return;
    setActing(true);
    setActionError("");
    try {
      await finalizePayrollRun(run.id, body);
      toast.success(`${formatMonth(month)} is locked.`);
      setConfirmFinalize(false);
      setOverrideOpen(false);
      setReason("");
      reload();
    } catch (requestError) {
      setActionError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setActing(false);
    }
  }

  function submitOverride() {
    const next = reason.trim();
    if (!next) {
      setReasonError("A reason is required to lock a month that still has blockers.");
      return;
    }
    finalize({ override: true, reason: next });
  }

  async function download(row) {
    setDownloadingId(row.id);
    try {
      await downloadPayslipPdf(row.id);
      toast.success("Payslip downloaded.");
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setDownloadingId("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {run ? (
          locked ? <Badge>Locked</Badge> : <Badge tone="amber">Draft</Badge>
        ) : null}
        {run ? <span className="text-sm text-zinc-500">{formatDays(run.workingDays)} working days in the month</span> : null}
        {canGenerate && !locked ? (
          <Button
            variant={run ? "secondary" : "primary"}
            onClick={() => {
              setActionError("");
              if (run) setConfirmGenerate(true);
              else generate();
            }}
            loading={acting && !confirmGenerate && !confirmFinalize && !overrideOpen}
            disabled={acting}
          >
            {run ? "Regenerate" : "Generate draft"}
          </Button>
        ) : null}
        {canFinalize && run && !locked ? (
          <>
            <Button onClick={() => { setActionError(""); setConfirmFinalize(true); }} disabled={acting || !checks?.ok}>
              Finalize
            </Button>
            {!checks?.ok ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setActionError("");
                  setReason("");
                  setReasonError("");
                  setOverrideOpen(true);
                }}
                disabled={acting}
              >
                Override
              </Button>
            ) : null}
          </>
        ) : null}
      </div>

      {locked ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          This month is locked. The draft cannot be regenerated. Payslips can still be downloaded.
        </p>
      ) : null}
      {!canFinalize && run && !locked ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Only an admin can lock this month.</p>
      ) : null}
      {actionError ? <FormAlert message={actionError} /> : null}

      {loading && !run ? <Spinner label={`Loading ${formatMonth(month)}`} /> : null}
      {!loading && error ? <ErrorState title="Could not load payroll" message={error} onRetry={reload} /> : null}

      {!loading && !error && !run ? (
        <EmptyState
          title={`No payroll for ${formatMonth(month)}`}
          message={
            canGenerate
              ? "Generate a draft to calculate gross, deductions, tax, and net from attendance and salary."
              : "HR has not generated a draft for this month."
          }
        />
      ) : null}

      {run ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Employees" value={formatDays(run.totals?.employees)} />
            <StatCard label="Gross" value={formatMoney(run.totals?.gross)} />
            <StatCard label="Deductions" value={formatMoney(run.totals?.deductions)} />
            <StatCard label="Tax" value={formatMoney(run.totals?.tax)} />
            <StatCard label="Net" value={formatMoney(run.totals?.net)} />
          </div>
          <ChecksPanel checks={checks} role={role} />
          <DataTable
            caption={`Payslips for ${formatMonth(month)}`}
            columns={[
              {
                key: "employee",
                header: "Employee",
                render: (row) => (
                  <span>
                    {row.employeeName || "Employee"}
                    {row.employeeCode ? <span className="mt-0.5 block text-xs text-zinc-500">{row.employeeCode}</span> : null}
                  </span>
                ),
              },
              {
                key: "workingDays",
                header: "Working days",
                align: "right",
                render: (row) => formatDays(row.breakdown?.inputs?.employedWorkingDays),
              },
              {
                key: "paidDays",
                header: "Paid days",
                align: "right",
                render: (row) => formatDays(paidDayCount(row.breakdown?.inputs)),
              },
              { key: "gross", header: "Gross", align: "right", render: (row) => formatMoney(row.gross) },
              { key: "deductions", header: "Deductions", align: "right", render: (row) => formatMoney(row.deductions) },
              { key: "tax", header: "Tax", align: "right", render: (row) => formatMoney(row.tax) },
              { key: "net", header: "Net", align: "right", render: (row) => formatMoney(row.net) },
              {
                key: "actions",
                header: "Payslip",
                render: (row) => (
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setSlip({ ...row, month: run.month })}>
                      Breakdown
                    </Button>
                    <Button variant="ghost" onClick={() => download(row)} loading={downloadingId === row.id}>
                      PDF
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={payslips}
            emptyTitle="No payslips in this draft"
            emptyMessage="People without a salary that covers the last day of the month are left out. They are listed in the checks."
          />
        </>
      ) : null}

      <PayslipDrawer
        slip={openSlip}
        downloading={Boolean(openSlip) && downloadingId === openSlip?.id}
        onDownload={download}
        onClose={() => setSlip(null)}
      />

      <ConfirmDialog
        open={confirmGenerate}
        title="Regenerate this draft?"
        message={`Regenerating replaces every payslip in the ${formatMonth(month)} draft. A locked month cannot be regenerated.`}
        confirmLabel="Regenerate"
        loading={acting}
        onConfirm={generate}
        onCancel={() => setConfirmGenerate(false)}
      />
      <ConfirmDialog
        open={confirmFinalize}
        title={`Lock ${formatMonth(month)}?`}
        message={`Finalizing locks ${formatMonth(month)}. HR cannot regenerate this run, and the month cannot be edited. Each employee with a payslip is notified.`}
        confirmLabel="Lock month"
        loading={acting}
        onConfirm={() => finalize({ override: false })}
        onCancel={() => setConfirmFinalize(false)}
      />
      <Modal
        open={overrideOpen}
        title={`Override and lock ${formatMonth(month)}`}
        onClose={acting ? () => {} : () => setOverrideOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOverrideOpen(false)} disabled={acting}>
              Cancel
            </Button>
            <Button onClick={submitOverride} loading={acting}>
              Lock month
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Checks are still failing. Locking the month anyway keeps those blockers in the audit log with your reason.
            The month cannot be edited after this.
          </p>
          <FormAlert message={actionError} />
          <Textarea
            name="reason"
            label="Reason"
            value={reason}
            error={reasonError}
            onChange={(event) => {
              setReason(event.target.value);
              setReasonError("");
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
