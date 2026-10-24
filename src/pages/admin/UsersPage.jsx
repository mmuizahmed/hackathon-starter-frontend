import { useCallback, useState } from "react";
import { TemporaryPasswordDialog } from "../../components/people/TemporaryPasswordDialog";
import { Badge, Button, ConfirmDialog, DataTable, FormAlert, Input, Modal, PageHeader } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createHrUser, listHrUsers, updateUser } from "../../features/users/api";
import { usePagedResource } from "../../hooks/usePagedResource";
import { messageFrom } from "../../lib/errors";
import { makeTemporaryPassword } from "../../lib/password";

export function AdminUsersPage() {
  const { user } = useAuth();
  const toast = useToast();
  const load = useCallback((page, signal) => listHrUsers({ page }, { signal }), []);
  const list = usePagedResource(load);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState(null);
  const [pending, setPending] = useState(null);
  const [working, setWorking] = useState(false);

  function openCreate() {
    setForm({ name: "", email: "" });
    setFormError("");
    setOpen(true);
  }

  async function onCreate(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Enter a name and an email.");
      return;
    }
    setSaving(true);
    setFormError("");
    const password = makeTemporaryPassword();
    try {
      const result = await createHrUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password,
        role: "hr",
      });
      setOpen(false);
      setIssued({
        email: result?.user?.email || form.email.trim(),
        password: result?.temporaryPassword || password,
      });
      list.setPage(1);
      list.refresh();
    } catch (error) {
      setFormError(messageFrom(error, "Could not create this HR login."));
    } finally {
      setSaving(false);
    }
  }

  async function onConfirm() {
    if (!pending) return;
    setWorking(true);
    try {
      if (pending.kind === "reset") {
        const result = await updateUser(pending.row.id, { resetPassword: true });
        setIssued({
          email: pending.row.email,
          password: result?.temporaryPassword || "",
          title: "New temporary password",
        });
        toast.success("Password reset. They must change it at the next sign-in.");
      } else {
        await updateUser(pending.row.id, { active: pending.kind === "reactivate" });
        toast.success(pending.kind === "reactivate" ? "Login reactivated." : "Login deactivated.");
      }
      setPending(null);
      list.refresh();
    } catch (error) {
      toast.error(messageFrom(error, "Could not update this login."));
      setPending(null);
    } finally {
      setWorking(false);
    }
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "active",
      header: "Status",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={row.active === false ? "neutral" : "green"}>{row.active === false ? "Inactive" : "Active"}</Badge>
          {row.mustChangePassword ? <Badge tone="amber">Must change password</Badge> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const self = row.id === user?.id;
        const inactive = row.active === false;
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-8 px-2"
              disabled={self && !inactive}
              onClick={() => setPending({ kind: inactive ? "reactivate" : "deactivate", row })}
            >
              {inactive ? "Reactivate" : "Deactivate"}
            </Button>
            <Button variant="ghost" className="h-8 px-2" onClick={() => setPending({ kind: "reset", row })}>
              Reset password
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="HR logins. Employee logins are created when HR registers a person."
        actions={<Button onClick={openCreate}>Create HR login</Button>}
      />
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
        caption="HR logins"
        emptyTitle="No HR logins"
        emptyMessage="Create an HR login so someone else can register employees."
      />
      <Modal
        open={open}
        title="Create HR login"
        onClose={() => (saving ? undefined : setOpen(false))}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="hr-user-form" loading={saving}>Create</Button>
          </>
        }
      >
        <form id="hr-user-form" className="space-y-3" onSubmit={onCreate}>
          <FormAlert message={formError} />
          <Input name="hrName" label="Name" value={form.name} required onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Input name="hrEmail" type="email" label="Email" value={form.email} required onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">A temporary password is generated and shown once after the login is created.</p>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.kind === "reset" ? "Reset password?" : pending?.kind === "reactivate" ? "Reactivate login?" : "Deactivate login?"}
        message={
          pending?.kind === "reset"
            ? `${pending.row.name} will get a new temporary password and must change it at the next sign-in.`
            : pending?.kind === "reactivate"
              ? `${pending.row.name} will be able to sign in again.`
              : `${pending?.row?.name || "This person"} will not be able to sign in.`
        }
        confirmLabel={pending?.kind === "reset" ? "Reset" : pending?.kind === "reactivate" ? "Reactivate" : "Deactivate"}
        tone={pending?.kind === "deactivate" ? "danger" : "primary"}
        loading={working}
        onConfirm={onConfirm}
        onCancel={() => setPending(null)}
      />
      <TemporaryPasswordDialog
        open={Boolean(issued)}
        title={issued?.title}
        email={issued?.email}
        password={issued?.password}
        onClose={() => setIssued(null)}
      />
    </div>
  );
}
