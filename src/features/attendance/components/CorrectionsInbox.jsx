import { useCallback, useState } from "react";
import { Button, DataTable, StatusPill } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { formatClock, formatDate, sourceLabel } from "../../../lib/format";
import { listAttendanceForDates, listCorrections, listEmployeeDirectory, reviewCorrection } from "../api";
import { ViewTabs } from "../../hr/ViewTabs";
import { ReviewCorrectionDialog } from "./ReviewCorrectionDialog";

const PAGE_SIZE = 20;

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function attendanceKey(employeeId, date) {
  return `${employeeId}:${date}`;
}

function RecordedCell({ row }) {
  if (!row) return <span className="text-zinc-500">No attendance row</span>;
  return (
    <span>
      <span className="block">
        {formatClock(row.checkIn, row.date)} – {formatClock(row.checkOut, row.date)}
      </span>
      <span className="text-xs text-zinc-500">
        {row.status ? row.status.replaceAll("_", " ") : "No status"} · {sourceLabel(row.source)}
      </span>
    </span>
  );
}

export function CorrectionsInbox({ canReview = false }) {
  const toast = useToast();
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const load = useCallback(
    async (signal) => {
      const corrections = await listCorrections({ status, page, limit: PAGE_SIZE }, { signal });
      const [employees, attendance] = await Promise.all([
        listEmployeeDirectory({ signal }),
        listAttendanceForDates((corrections?.items || []).map((item) => item.date), { signal }),
      ]);
      return { corrections, employees, attendance };
    },
    [status, page],
  );
  const { data, error, loading, reload } = useAbortableRequest(load);

  const names = new Map((data?.employees || []).map((employee) => [employee.id, employee]));
  const recorded = new Map(
    (data?.attendance || []).map((row) => [attendanceKey(row.employeeId, row.date), row]),
  );
  const result = data?.corrections;
  const rows = result?.items || [];

  function changeTab(next) {
    setStatus(next);
    setPage(1);
  }

  async function submitReview(comment) {
    if (!dialog) return;
    setBusy(true);
    setDialogError("");
    try {
      await reviewCorrection(dialog.correction.id, { decision: dialog.decision, comment });
      toast.success(dialog.decision === "approved" ? "Correction approved." : "Correction rejected.");
      setDialog(null);
      reload();
    } catch (requestError) {
      setDialogError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => {
        const person = names.get(row.employeeId);
        return person ? (
          <span>
            {person.name}
            <span className="mt-0.5 block text-xs text-zinc-500">{person.code}</span>
          </span>
        ) : (
          row.employeeId
        );
      },
    },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    {
      key: "requested",
      header: "Requested",
      wrap: true,
      render: (row) =>
        `${formatClock(row.requestedCheckIn, row.date)} – ${formatClock(row.requestedCheckOut, row.date)}`,
    },
    {
      key: "recorded",
      header: "Recorded",
      wrap: true,
      render: (row) => <RecordedCell row={recorded.get(attendanceKey(row.employeeId, row.date))} />,
    },
    { key: "reason", header: "Reason", wrap: true, render: (row) => row.reason },
    { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
  ];

  if (canReview && status === "pending") {
    columns.push({
      key: "actions",
      header: "Review",
      render: (row) => (
        <div className="flex gap-2">
          <Button onClick={() => { setDialogError(""); setDialog({ correction: row, decision: "approved" }); }}>
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => { setDialogError(""); setDialog({ correction: row, decision: "rejected" }); }}
          >
            Reject
          </Button>
        </div>
      ),
    });
  } else {
    columns.push({
      key: "reviewComment",
      header: "Comment",
      wrap: true,
      render: (row) => row.reviewComment || "—",
    });
  }

  return (
    <div className="space-y-4">
      <ViewTabs label="Correction status" value={status} options={TABS} onChange={changeTab} />
      <DataTable
        caption="Attendance corrections"
        columns={columns}
        rows={loading ? [] : rows}
        page={result?.page || page}
        limit={result?.limit || PAGE_SIZE}
        total={loading ? 0 : result?.total || 0}
        onPageChange={setPage}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle={`No ${status.replaceAll("_", " ")} corrections`}
        emptyMessage="Requests show up here after an employee asks to change a check-in or check-out."
      />
      <ReviewCorrectionDialog
        correction={dialog?.correction}
        decision={dialog?.decision}
        busy={busy}
        error={dialogError}
        onClose={() => setDialog(null)}
        onSubmit={submitReview}
      />
    </div>
  );
}
