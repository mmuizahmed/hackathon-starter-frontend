import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  DatePicker,
  ErrorState,
  FormAlert,
  PageHeader,
  Select,
  Spinner,
  StatusPill,
  Textarea,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { applyForLeave, cancelLeaveRequest, getLeaveBalances, listLeaveRequests, listLeaveTypes } from "../../features/leave/api";
import { canCancelLeave, countWeekdays } from "../../features/leave/rules";
import { leaveTypeChoices } from "../../features/leave/typeOptions";
import { formatDateRange, todayInKarachi } from "../../lib/format";
import { LeaveBalanceList } from "./dashboard/LeaveBalanceList";
import { SmartLeaveBox } from "./leave/SmartLeaveBox";

const LIMIT = 10;
const EMPTY_FORM = { leaveTypeId: "", startDate: "", endDate: "", reason: "" };

export function EmployeeLeavePage() {
  const toast = useToast();
  const today = todayInKarachi();
  const [balances, setBalances] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [requests, setRequests] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [aiFilled, setAiFilled] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingCancel, setPendingCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);

    Promise.all([
      getLeaveBalances({}, { signal: controller.signal }),
      listLeaveRequests({ page, limit: LIMIT }, { signal: controller.signal }),
      listLeaveTypes({ limit: 100 }, { signal: controller.signal }).catch((typeError) => {
        if (typeError?.name === "AbortError") throw typeError;
        return { items: [] };
      }),
    ])
      .then(([balancePage, requestPage, typePage]) => {
        if (!active) return;
        setBalances(balancePage?.items || []);
        setRequests(requestPage);
        setCatalog(typePage?.items || []);
        setError("");
      })
      .catch((requestError) => {
        if (!active || requestError.name === "AbortError") return;
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadKey]);

  const choices = useMemo(() => leaveTypeChoices({ balances, catalog }), [balances, catalog]);
  const selectable = choices.filter((choice) => choice.id);
  const weekdays = countWeekdays(form.startDate, form.endDate);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function applyDraft(draft) {
    const match = choices.find((choice) => choice.code === draft.code);
    setForm({
      leaveTypeId: match?.id || "",
      startDate: draft.startDate,
      endDate: draft.endDate,
      reason: draft.reason,
    });
    setAiFilled(true);
    setFormError("");
    setFieldErrors(match?.id ? {} : { leaveTypeId: "Choose a leave type." });
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = {};
    if (!form.leaveTypeId) nextErrors.leaveTypeId = "Choose a leave type.";
    if (!form.startDate) nextErrors.startDate = "Choose a start date.";
    if (!form.endDate) nextErrors.endDate = "Choose an end date.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "The end date must be on or after the start date.";
    }
    if (!form.reason.trim()) nextErrors.reason = "Add a reason.";
    setFieldErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const saved = await applyForLeave({
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      });
      toast.success(`Leave requested for ${saved?.days ?? weekdays} working days.`);
      setForm(EMPTY_FORM);
      setAiFilled(false);
      setPage(1);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      setFormError(requestError.message);
      if (requestError.errors) {
        setFieldErrors((current) => ({
          ...current,
          leaveTypeId: requestError.errors.leaveTypeId,
          startDate: requestError.errors.startDate,
          endDate: requestError.errors.endDate,
          reason: requestError.errors.reason,
        }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmCancel() {
    if (!pendingCancel || cancelling) return;
    setCancelling(true);
    try {
      await cancelLeaveRequest(pendingCancel.id);
      toast.success("Leave request cancelled.");
      setPendingCancel(null);
      setReloadKey((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Leave" description="Your balance, a request, and the history you can still cancel." />
      {loading && !requests ? <Spinner label="Loading leave" /> : null}
      {error && !requests ? <ErrorState title="Could not load leave" message={error} onRetry={() => setReloadKey((value) => value + 1)} /> : null}

      {requests ? (
        <>
          {/* Wide screens: the form on the left, balances beside it. */}
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            <div className="lg:order-2">
              <LeaveBalanceList items={choices.length ? choices : balances} />
            </div>
            <div className="space-y-4 lg:order-1 lg:col-span-2">
              <SmartLeaveBox onDraft={applyDraft} />
              <Card title="Apply for leave">
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  {aiFilled ? (
                    <div className="rounded-control border border-brand-200 bg-brand-50 px-3 py-3 dark:border-brand-800 dark:bg-zinc-950">
                      <Badge tone="blue">AI-filled, please review</Badge>
                      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                        Check the type, dates, and reason. Nothing is saved until you submit this form.
                      </p>
                    </div>
                  ) : null}
                  <FormAlert message={formError} />
                  <Select
                    name="leaveTypeId"
                    label="Type"
                    placeholder="Choose a type"
                    value={form.leaveTypeId}
                    error={fieldErrors.leaveTypeId}
                    options={selectable.map((choice) => ({ value: choice.id, label: choice.name }))}
                    required
                    onChange={(event) => update("leaveTypeId", event.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <DatePicker
                      name="startDate"
                      label="Start"
                      value={form.startDate}
                      error={fieldErrors.startDate}
                      required
                      onChange={(event) => update("startDate", event.target.value)}
                    />
                    <DatePicker
                      name="endDate"
                      label="End"
                      value={form.endDate}
                      error={fieldErrors.endDate}
                      required
                      onChange={(event) => update("endDate", event.target.value)}
                    />
                  </div>
                  {form.startDate && form.endDate ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {weekdays} weekday{weekdays === 1 ? "" : "s"} in this range. The server also skips public holidays and stores that working-day count.
                    </p>
                  ) : null}
                  <Textarea
                    name="reason"
                    label="Reason"
                    value={form.reason}
                    error={fieldErrors.reason}
                    required
                    onChange={(event) => update("reason", event.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" loading={submitting} className="w-full sm:w-auto">
                      Submit request
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
          <h2 className="pt-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">My requests</h2>
          <DataTable
            caption="My leave requests"
            columns={[
              { key: "type", header: "Type", render: (row) => row.leaveType?.name || "—" },
              {
                key: "dates",
                header: "Dates",
                render: (row) => formatDateRange(row.startDate, row.endDate),
              },
              { key: "days", header: "Working days", align: "right" },
              { key: "status", header: "Status", render: (row) => <StatusPill status={row.status} /> },
              {
                key: "cancel",
                header: "",
                render: (row) =>
                  canCancelLeave(row, today) ? (
                    <Button variant="ghost" onClick={() => setPendingCancel(row)}>
                      Cancel
                    </Button>
                  ) : null,
              },
            ]}
            rows={requests.items || []}
            page={requests.page || page}
            limit={requests.limit || LIMIT}
            total={requests.total || 0}
            onPageChange={setPage}
            loading={loading}
            error={error}
            onRetry={() => setReloadKey((value) => value + 1)}
            emptyTitle="No leave requests"
            emptyMessage="A request shows here after you submit the form."
          />
        </>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        title="Cancel this leave?"
        message="The request is withdrawn. Approved leave can only be cancelled before it starts."
        confirmLabel="Cancel leave"
        tone="danger"
        loading={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}
