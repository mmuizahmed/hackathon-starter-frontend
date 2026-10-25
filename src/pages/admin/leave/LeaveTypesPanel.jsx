import { useCallback, useState } from "react";
import { Badge, Button, DataTable, FormAlert, Input } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { listLeaveTypes, updateLeaveType } from "../../../features/organization/api";
import { usePagedResource } from "../../../hooks/usePagedResource";
import { messageFrom } from "../../../lib/errors";

function QuotaCell({ row, onSaved }) {
  const toast = useToast();
  const [quota, setQuota] = useState(row.yearlyQuota == null ? "" : String(row.yearlyQuota));
  const [paid, setPaid] = useState(Boolean(row.paid));
  const [active, setActive] = useState(row.active !== false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave() {
    if (quota !== "" && (Number.isNaN(Number(quota)) || Number(quota) < 0)) {
      setError("Enter a quota of 0 or more, or leave it blank for unlimited.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateLeaveType(row.id, {
        yearlyQuota: quota === "" ? null : Number(quota),
        paid,
        active,
      });
      toast.success(`${row.code} updated.`);
      onSaved();
    } catch (err) {
      setError(messageFrom(err, "Could not update this leave type."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2 py-1">
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-28">
          <Input
            name={`quota-${row.id}`}
            label="Yearly quota"
            type="number"
            min="0"
            step="1"
            value={quota}
            placeholder="Unlimited"
            onChange={(event) => setQuota(event.target.value)}
          />
        </div>
        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={paid} onChange={(event) => setPaid(event.target.checked)} />
          Paid
        </label>
        <label className="mb-2 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Active
        </label>
        <Button className="mb-0.5 h-10" onClick={onSave} loading={saving}>
          Save
        </Button>
      </div>
      {error ? <FormAlert message={error} /> : null}
    </div>
  );
}

export function LeaveTypesPanel() {
  const load = useCallback((page, signal) => listLeaveTypes({ page, limit: 20 }, { signal }), []);
  const list = usePagedResource(load);

  const columns = [
    {
      key: "name",
      header: "Leave type",
      render: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-zinc-500">{row.code}</p>
        </div>
      ),
    },
    {
      key: "quota",
      header: "Quota",
      wrap: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.yearlyQuota == null ? "Unlimited" : row.yearlyQuota}</span>
          {row.paid ? <Badge tone="green">Paid</Badge> : <Badge tone="neutral">Unpaid</Badge>}
          {row.active === false ? <Badge tone="neutral">Inactive</Badge> : null}
        </div>
      ),
    },
    {
      key: "edit",
      header: "Edit",
      wrap: true,
      render: (row) => <QuotaCell key={`${row.id}-${row.updatedAt || ""}`} row={row} onSaved={list.refresh} />,
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Leave types</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Setup creates Annual, Sick, Casual, and Unpaid. A blank quota means unlimited.
      </p>
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        error={list.error}
        onRetry={list.refresh}
        page={list.page}
        limit={list.limit}
        total={list.total}
        onPageChange={list.setPage}
        caption="Leave types"
        mobileRow={(row) => (
          <div className="space-y-3 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              {columns[0].render(row)}
              {columns[1].render(row)}
            </div>
            <QuotaCell key={`${row.id}-${row.updatedAt || ""}`} row={row} onSaved={list.refresh} />
          </div>
        )}
        emptyTitle="No leave types"
        emptyMessage="Leave types appear after company setup."
      />
    </section>
  );
}
