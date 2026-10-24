import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Button, IconButton } from "../../../components/ui";
import { formatDays, formatMoney, formatMonth } from "../../../lib/format";
import { describeLine } from "../payslipLines";

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm tabular-nums text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

export function PayslipDrawer({ slip, downloading, onDownload, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!slip) return undefined;
    const node = panelRef.current;
    node?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [slip]);

  if (!slip) return null;

  const breakdown = slip.breakdown || {};
  const inputs = breakdown.inputs || {};
  const lines = Array.isArray(breakdown.lines) ? breakdown.lines : [];
  const tax = breakdown.tax || {};

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" className="absolute inset-0 bg-zinc-950/40" aria-label="Close payslip" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-zinc-200 bg-white shadow-pop focus-visible:outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              {slip.employeeName || "Payslip"}
            </h2>
            <p className="text-sm text-zinc-500">
              {slip.employeeCode ? `${slip.employeeCode} · ` : ""}
              {formatMonth(slip.month)}
            </p>
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Gross" value={formatMoney(slip.gross)} />
            <Fact label="Deductions" value={formatMoney(slip.deductions)} />
            <Fact label="Tax" value={formatMoney(slip.tax)} />
            <Fact label="Net" value={formatMoney(slip.net)} />
          </dl>

          <h3 className="mt-6 text-sm font-semibold text-zinc-950 dark:text-zinc-50">Lines</h3>
          {lines.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">This payslip did not include a line breakdown.</p>
          ) : (
            <table className="mt-2 w-full text-left text-sm">
              <caption className="sr-only">Payslip lines</caption>
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                  <th scope="col" className="py-2 pr-3 font-medium">Line</th>
                  <th scope="col" className="py-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const detail = describeLine(line);
                  return (
                    <tr key={line.label} className="border-b border-zinc-100 align-top dark:border-zinc-800">
                      <td className="py-2 pr-3">
                        <p className="text-zinc-900 dark:text-zinc-100">{line.label}</p>
                        {detail ? <p className="mt-0.5 text-xs leading-5 text-zinc-500">{detail}</p> : null}
                      </td>
                      <td className="py-2 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatMoney(line.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {tax.slabLabel || tax.formula ? (
            <div className="mt-4 rounded-control border border-zinc-200 px-3 py-2 dark:border-zinc-700">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Tax slab</p>
              {tax.slabLabel ? <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{tax.slabLabel}</p> : null}
              {tax.formula ? <p className="mt-1 text-xs leading-5 text-zinc-500">{tax.formula}</p> : null}
            </div>
          ) : null}

          <h3 className="mt-6 text-sm font-semibold text-zinc-950 dark:text-zinc-50">Inputs</h3>
          <dl className="mt-2 grid grid-cols-2 gap-3">
            <Fact label="Month working days" value={formatDays(inputs.workingDays)} />
            <Fact label="Employed days" value={formatDays(inputs.employedWorkingDays)} />
            <Fact label="Present" value={formatDays(inputs.presentDays)} />
            <Fact label="Late" value={formatDays(inputs.lateDays)} />
            <Fact label="Half days" value={formatDays(inputs.halfDays)} />
            <Fact label="Absent" value={formatDays(inputs.absentDays)} />
            <Fact label="Unpaid leave" value={formatDays(inputs.unpaidLeaveDays)} />
            <Fact label="Paid leave" value={formatDays(inputs.paidLeaveDays)} />
            <Fact label="Missing checkout" value={formatDays(inputs.missingCheckoutDays)} />
            <Fact label="Per day" value={formatMoney(inputs.perDayRate)} />
          </dl>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onDownload(slip)} loading={downloading}>
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
