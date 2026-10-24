import { Button, StatusPill } from "../../../components/ui";
import { formatDateRange, formatDays } from "../../../lib/format";
import { balanceText, colleagueText, holidayText, yearLeaveText } from "../contextLabel";

function ContextLine({ label, children }) {
  return (
    <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300">
      <span className="font-medium text-zinc-800 dark:text-zinc-100">{label}. </span>
      {children}
    </p>
  );
}

export function LeaveRecord({ request, canReview, busy, onApprove, onReject }) {
  const context = request.context;
  const pending = request.status === "pending";

  return (
    <article className="grid gap-3 px-3 py-3 lg:grid-cols-12 lg:items-start">
      <div className="lg:col-span-3">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{request.employeeName || "Employee"}</p>
        <p className="text-xs text-zinc-500">{request.employeeCode || request.employeeId}</p>
        <div className="mt-2 lg:hidden">
          <StatusPill status={request.status} />
        </div>
      </div>
      <div className="text-sm text-zinc-800 dark:text-zinc-100 lg:col-span-3">
        <p>{request.leaveType?.name || "Leave"}</p>
        <p className="text-xs text-zinc-500">{formatDateRange(request.startDate, request.endDate)}</p>
        <p className="text-xs text-zinc-500">{formatDays(request.days)} working days</p>
        <p className="mt-1 text-sm leading-5 text-zinc-700 dark:text-zinc-200">{request.reason}</p>
      </div>
      <div className="space-y-1 lg:col-span-4">
        {context ? (
          <>
            <ContextLine label="Balance">{balanceText(request)}</ContextLine>
            <ContextLine label="Holidays">{holidayText(context.holidays)}</ContextLine>
            <ContextLine label="Colleagues">{colleagueText(context.colleaguesOnLeave)}</ContextLine>
            <ContextLine label="This year">{yearLeaveText(context.approvedThisYear)}</ContextLine>
          </>
        ) : (
          <p className="text-xs text-zinc-500">Context is only included for admin and HR.</p>
        )}
        {request.reviewComment ? (
          <ContextLine label="Review">{request.reviewComment}</ContextLine>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:col-span-2 lg:justify-end">
        <span className="hidden lg:inline-flex">
          <StatusPill status={request.status} />
        </span>
        {canReview && pending ? (
          <>
            <Button onClick={() => onApprove(request)} loading={busy} disabled={busy}>
              Approve
            </Button>
            <Button variant="danger" onClick={() => onReject(request)} disabled={busy}>
              Reject
            </Button>
          </>
        ) : null}
      </div>
    </article>
  );
}
