import { useCallback, useState } from "react";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Input, Modal } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { usePagedResource } from "../../../hooks/usePagedResource";
import { ApiError } from "../../../lib/api";
import { messageFrom } from "../../../lib/errors";

export function NameCatalog({ title, noun, list, create, update, remove }) {
  const toast = useToast();
  const load = useCallback((page, signal) => list({ page, limit: 20 }, { signal }), [list]);
  const catalog = usePagedResource(load);
  const [editor, setEditor] = useState(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditor({ mode: "create" });
    setName("");
    setActive(true);
    setFormError("");
  }

  function openEdit(row) {
    setEditor({ mode: "edit", row });
    setName(row.name);
    setActive(row.active !== false);
    setFormError("");
  }

  async function onSave(event) {
    event.preventDefault();
    if (!name.trim()) {
      setFormError(`Enter a ${noun} name.`);
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editor.mode === "create") await create(name.trim());
      else await update(editor.row.id, { name: name.trim(), active });
      setEditor(null);
      catalog.refresh();
      toast.success(editor.mode === "create" ? `${title} entry added.` : `${title} entry updated.`);
    } catch (error) {
      setFormError(messageFrom(error, `Could not save this ${noun}.`));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await remove(pendingDelete.id);
      setPendingDelete(null);
      catalog.refresh();
      toast.success(`${pendingDelete.name} deleted.`);
    } catch (error) {
      const inUse = error instanceof ApiError && error.status === 409;
      setDeleteError(
        inUse
          ? `${error.message} It stays in the list. Edit it and turn Active off if you want to stop using it.`
          : messageFrom(error, `Could not delete this ${noun}.`),
      );
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "active",
      header: "Status",
      render: (row) => <Badge tone={row.active === false ? "neutral" : "green"}>{row.active === false ? "Inactive" : "Active"}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" className="h-8 px-2" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="ghost" className="h-8 px-2" onClick={() => { setDeleteError(""); setPendingDelete(row); }}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{title}</h2>
        <Button onClick={openCreate}>Add {noun}</Button>
      </div>
      <DataTable
        columns={columns}
        rows={catalog.items}
        loading={catalog.loading}
        error={catalog.error}
        onRetry={catalog.refresh}
        page={catalog.page}
        limit={catalog.limit}
        total={catalog.total}
        onPageChange={catalog.setPage}
        caption={title}
        emptyTitle={`No ${noun}s yet`}
        emptyMessage={`Add a ${noun} before HR registers someone who needs it.`}
      />
      <Modal
        open={Boolean(editor)}
        title={editor?.mode === "edit" ? `Edit ${noun}` : `Add ${noun}`}
        onClose={() => (saving ? null : setEditor(null))}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditor(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="name-catalog-form" loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form id="name-catalog-form" className="space-y-3" onSubmit={onSave}>
          <FormAlert message={formError} />
          <Input name="catalogName" label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          {editor?.mode === "edit" ? (
            <label className="flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand-700"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />
              Active
            </label>
          ) : null}
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name || noun}?`}
        message={deleteError || `This removes the ${noun}. If people are assigned to it, the server will refuse.`}
        confirmLabel="Delete"
        tone="danger"
        loading={deleting}
        onConfirm={onDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
