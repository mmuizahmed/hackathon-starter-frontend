import { useCallback, useState } from "react";
import { Button, DataTable, DatePicker, Input, PageHeader } from "../../components/ui";
import { listAudit } from "../../features/audit/api";
import { usePagedResource } from "../../hooks/usePagedResource";
import { formatDateTime } from "../../lib/format";

const EMPTY = { action: "", entity: "", from: "", to: "" };

function JsonBlock({ value }) {
  return (
    <pre className="max-h-64 overflow-auto rounded-control bg-zinc-50 p-2 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function AdminAuditLogPage() {
  const [draft, setDraft] = useState(EMPTY);
  const [filters, setFilters] = useState(EMPTY);
  const load = useCallback((page, signal) => listAudit({ ...filters, page }, { signal }), [filters]);
  const list = usePagedResource(load);

  function apply(event) {
    event.preventDefault();
    setFilters({
      action: draft.action.trim(),
      entity: draft.entity.trim(),
      // Date-only values are midnight UTC, which drops the rest of the Karachi day.
      from: draft.from ? `${draft.from}T00:00:00+05:00` : "",
      to: draft.to ? `${draft.to}T23:59:59.999+05:00` : "",
    });
    list.setPage(1);
  }

  const columns = [
    {
      key: "actor",
      header: "Actor",
      wrap: true,
      render: (row) =>
        row.actor ? (
          <div>
            <p>{row.actor.name || "Unknown"}</p>
            <p className="text-xs text-zinc-500">{row.actor.email} · {row.actor.role}</p>
          </div>
        ) : (
          "System"
        ),
    },
    { key: "action", header: "Action" },
    {
      key: "entity",
      header: "Entity",
      render: (row) => (
        <span>
          {row.entity}
          {row.entityId ? <span className="block text-xs text-zinc-500">{row.entityId}</span> : null}
        </span>
      ),
    },
    { key: "timestamp", header: "Time", render: (row) => formatDateTime(row.timestamp) },
    {
      key: "diff",
      header: "Changes",
      wrap: true,
      render: (row) => (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-brand-800 dark:text-brand-200">Before / after</summary>
          <div className="mt-2 grid gap-2 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Before</p>
              <JsonBlock value={row.before} />
            </div>
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">After</p>
              <JsonBlock value={row.after} />
            </div>
          </div>
        </details>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Who changed what. Times are shown in Asia/Karachi. Entries cannot be edited." />
      <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5" onSubmit={apply}>
        <Input name="action" label="Action" placeholder="employee.create" value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))} />
        <Input name="entity" label="Entity" placeholder="Employee" value={draft.entity} onChange={(event) => setDraft((current) => ({ ...current, entity: event.target.value }))} />
        <DatePicker name="from" label="From" value={draft.from} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} />
        <DatePicker name="to" label="To" value={draft.to} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} />
        <div className="flex items-end gap-2">
          <Button type="submit">Apply</Button>
          <Button type="button" variant="secondary" onClick={() => { setDraft(EMPTY); setFilters(EMPTY); list.setPage(1); }}>Clear</Button>
        </div>
      </form>
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
        caption="Audit log"
        emptyTitle="No audit entries"
        emptyMessage="Changes to settings, people, and announcements show up here."
      />
    </div>
  );
}
