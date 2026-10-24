import { useCallback, useState } from "react";
import { Button, EmptyState, ErrorState, FilterBar } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { useAbortableRequest } from "../../../hooks/useAbortableRequest";
import { listDepartments, listLeaveRequests, reviewLeave } from "../api";
import { ViewTabs } from "../../hr/ViewTabs";
import { LeaveRecord } from "./LeaveRecord";
import { RejectLeaveDialog } from "./RejectLeaveDialog";

const PAGE_SIZE = 20;

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function departmentOptions(items) {
  return (items || []).map((department) => ({ value: department.id, label: department.name }));
}

export function LeaveInbox({ canReview = false }) {
  const toast = useToast();
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ from: "", to: "", department: "" });
  const [rejecting, setRejecting] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [rejectError, setRejectError] = useState("");

  const loadDepartments = useCallback((signal) => listDepartments({ signal }), []);
  const departments = useAbortableRequest(loadDepartments);

  const load = useCallback(
    (signal) =>
      listLeaveRequests(
        {
          status,
          page,
          limit: PAGE_SIZE,
          from: filters.from,
          to: filters.to,
          departmentId: filters.department,
        },
        { signal },
      ),
    [status, page, filters],
  );
  const { data, error, loading, reload } = useAbortableRequest(load);
  const rows = data?.items || [];
  const total = data?.total || 0;
  const limit = data?.limit || PAGE_SIZE;
  const currentPage = data?.page || page;
  const from = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  function changeTab(next) {
    setStatus(next);
    setPage(1);
  }

  function changeFilters(next) {
    setFilters(next);
    setPage(1);
  }

  async function approve(request) {
    setBusyId(request.id);
    try {
      await reviewLeave(request.id, { decision: "approved" });
      toast.success(`Approved ${request.leaveType?.name || "leave"} for ${request.employeeName || "the employee"}.`);
      reload();
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setBusyId("");
    }
  }

  async function reject(comment) {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    setRejectError("");
    try {
      await reviewLeave(rejecting.id, { decision: "rejected", comment });
      toast.success(`Rejected leave for ${rejecting.employeeName || "the employee"}.`);
      setRejecting(null);
      reload();
    } catch (requestError) {
      setRejectError(requestError.message);
      toast.error(requestError.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-4">
      <ViewTabs label="Leave status" value={status} options={TABS} onChange={changeTab} />
      <FilterBar
        from={filters.from}
        to={filters.to}
        department={filters.department}
        departments={departmentOptions(departments.data?.items)}
        onChange={changeFilters}
        onClear={() => changeFilters({ from: "", to: "", department: "" })}
      />
      {departments.error ? <p className="text-sm text-red-700 dark:text-red-400">{departments.error}</p> : null}

      <div className="overflow-hidden rounded-card border border-zinc-200 bg-white shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <div className="hidden border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400 lg:grid lg:grid-cols-12">
          <span className="col-span-3">Employee</span>
          <span className="col-span-3">Request</span>
          <span className="col-span-4">Context</span>
          <span className="col-span-2 text-right">Review</span>
        </div>
        {error && !loading ? (
          <div className="p-4">
            <ErrorState title="Could not load leave" message={error} onRetry={reload} />
          </div>
        ) : null}
        {loading ? (
          <div className="space-y-3 p-4" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="block h-16 animate-pulse rounded-control bg-zinc-100 dark:bg-zinc-800" />
            ))}
            <span className="sr-only">Loading leave requests</span>
          </div>
        ) : null}
        {!loading && !error && rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title={`No ${status} requests`}
              message="Requests appear here after someone applies. Balance, holidays, and colleagues are loaded with each row."
            />
          </div>
        ) : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((request) => (
              <LeaveRecord
                key={request.id}
                request={request}
                canReview={canReview}
                busy={busyId === request.id}
                onApprove={approve}
                onReject={(row) => {
                  setRejectError("");
                  setRejecting(row);
                }}
              />
            ))}
          </div>
        ) : null}
        {!loading && total > 0 ? (
          <div className="flex flex-col gap-2 border-t border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {from}–{to} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                Previous
              </Button>
              <Button variant="secondary" disabled={currentPage * limit >= total} onClick={() => setPage(currentPage + 1)}>
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <RejectLeaveDialog
        request={rejecting}
        busy={Boolean(rejecting) && busyId === rejecting?.id}
        error={rejectError}
        onClose={() => setRejecting(null)}
        onSubmit={reject}
      />
    </div>
  );
}
