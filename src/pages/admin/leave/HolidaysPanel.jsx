import { useCallback, useMemo, useState } from "react";
import { Badge, Button, ConfirmDialog, DataTable, DatePicker, FormAlert, Input, Modal, Select } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { createHoliday, deleteHoliday, listHolidays, updateHoliday } from "../../../features/organization/api";
import { usePagedResource } from "../../../hooks/usePagedResource";
import { formatDate } from "../../../lib/format";
import { messageFrom } from "../../../lib/errors";

const EMPTY = { date: "", name: "", tentative: false };

function yearOptions() {
  const start = new Date().getFullYear() - 1;
  return Array.from({ length: 6 }, (_, index) => {
    const year = String(start + index);
    return { value: year, label: year };
  });
}

export function HolidaysPanel() {
  const toast = useToast();
  const years = useMemo(() => yearOptions(), []);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const load = useCallback((page, signal) => listHolidays({ year, page, limit: 20 }, { signal }), [year]);
  const list = usePagedResource(load);
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditor({ mode: "create" });
    setForm({ ...EMPTY, date: `${year}-01-01` });
    setFormError("");
  }

  function openEdit(row) {
    setEditor({ mode: "edit", row });
    setForm({ date: row.date, name: row.name, tentative: Boolean(row.tentative) });
    setFormError("");
  }

  async function onSave(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.date) {
      setFormError("Enter a date and a name.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const body = { date: form.date, name: form.name.trim(), tentative: form.tentative };
      if (editor.mode === "create") await createHoliday(body);
      else await updateHoliday(editor.row.id, body);
      setEditor(null);
      if (form.date.slice(0, 4) !== year) setYear(form.date.slice(0, 4));
      list.setPage(1);
      list.refresh();
      toast.success("Holiday saved.");
    } catch (error) {
      setFormError(messageFrom(error, "Could not save this holiday."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteHoliday(pendingDelete.id);
      setPendingDelete(null);
      list.refresh();
      toast.success("Holiday deleted.");
    } catch (error) {
      toast.error(messageFrom(error, "Could not delete this holiday."));
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "name", header: "Name" },
    {
      key: "tentative",
      header: "Sighting",
      render: (row) => (row.tentative ? <Badge tone="amber">Tentative (moon sighting)</Badge> : <Badge tone="neutral">Fixed</Badge>),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 px-2" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="secondary" className="h-8 px-2" onClick={() => setPendingDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Holidays</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A tentative holiday still counts as a day off.</p>
        </div>
        <div className="flex items-end gap-2">
          <Select name="holidayYear" label="Year" value={year} options={years} onChange={(event) => { setYear(event.target.value); list.setPage(1); }} />
          <Button onClick={openCreate}>Add holiday</Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={list.items}
        mobileRow={(row) => (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">{row.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(row.date)}
                {row.tentative ? " · Tentative" : ""}
              </p>
            </div>
            {columns[columns.length - 1].render(row)}
          </div>
        )}
        loading={list.loading}
        error={list.error}
        onRetry={list.refresh}
        page={list.page}
        limit={list.limit}
        total={list.total}
        onPageChange={list.setPage}
        caption={`Holidays in ${year}`}
        emptyTitle={`No holidays in ${year}`}
        emptyMessage="Add a public holiday for this year."
      />
      <Modal
        open={Boolean(editor)}
        title={editor?.mode === "edit" ? "Edit holiday" : "Add holiday"}
        onClose={() => (saving ? undefined : setEditor(null))}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="holiday-form" loading={saving}>Save</Button>
          </>
        }
      >
        <form id="holiday-form" className="space-y-3" onSubmit={onSave}>
          <FormAlert message={formError} />
          <DatePicker name="holidayDate" label="Date" value={form.date} required onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
          <Input name="holidayName" label="Name" value={form.name} required onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand-700"
              checked={form.tentative}
              onChange={(event) => setForm((current) => ({ ...current, tentative: event.target.checked }))}
            />
            Tentative (moon sighting)
          </label>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete holiday?"
        message={pendingDelete ? `${pendingDelete.name} on ${formatDate(pendingDelete.date)} will be removed.` : ""}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={onDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
