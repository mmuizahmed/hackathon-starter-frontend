import { useCallback, useState } from "react";
import { Badge, Button, Card, EmptyState, ErrorState, FormAlert, Input, PageHeader, Select, Spinner, Textarea } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { AUDIENCE_OPTIONS, createAnnouncement, listAnnouncements, updateAnnouncement } from "../../../features/announcements/api";
import { usePagedResource } from "../../../hooks/usePagedResource";
import { messageFrom } from "../../../lib/errors";
import { formatDateTime } from "../../../lib/format";

const AUDIENCE_LABEL = { all: "Everyone", admin: "Admins", hr: "HR", employee: "Employees" };

export function AnnouncementBoard({ canPost }) {
  const toast = useToast();
  const load = useCallback(
    (page, signal) => listAnnouncements(canPost ? { page, limit: 20, includeInactive: true } : { page, limit: 20 }, { signal }),
    [canPost],
  );
  const list = usePagedResource(load);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState("");

  async function onPost(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFormError("Enter a title and a message.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createAnnouncement({ title: form.title.trim(), body: form.body.trim(), audience: form.audience });
      setForm({ title: "", body: "", audience: "all" });
      list.setPage(1);
      list.refresh();
      toast.success("Announcement posted.");
    } catch (error) {
      setFormError(messageFrom(error, "Could not post this announcement."));
    } finally {
      setSaving(false);
    }
  }

  async function setActive(row, active) {
    setWorkingId(row.id);
    try {
      await updateAnnouncement(row.id, { active });
      list.refresh();
      toast.success(active ? "Announcement restored." : "Announcement hidden.");
    } catch (error) {
      toast.error(messageFrom(error, "Could not update this announcement."));
    } finally {
      setWorkingId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description={canPost ? "Post a message. The newest one is first." : "Messages from Admin and HR. The newest one is first."}
      />
      {canPost ? (
        <Card title="New announcement">
          <form className="space-y-3" onSubmit={onPost}>
            <FormAlert message={formError} />
            <Input name="title" label="Title" value={form.title} required onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <Textarea name="body" label="Message" value={form.body} required onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
            <Select name="audience" label="Audience" value={form.audience} options={AUDIENCE_OPTIONS} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Post</Button>
            </div>
          </form>
        </Card>
      ) : null}
      {list.loading ? <Spinner label="Loading announcements" /> : null}
      {list.error ? <ErrorState title="Could not load announcements" message={list.error} onRetry={list.refresh} /> : null}
      {!list.loading && !list.error && list.items.length === 0 ? (
        <EmptyState title="No announcements" message="Nothing has been posted yet." />
      ) : null}
      {list.items.length > 0 ? (
      <div className="divide-y divide-zinc-200 rounded-card border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {list.items.map((row) => (
          <article key={row.id} className="space-y-2 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{row.title}</h2>
              <Badge tone="blue">{AUDIENCE_LABEL[row.audience] || row.audience}</Badge>
              {row.active === false ? <Badge tone="neutral">Inactive</Badge> : null}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700 dark:text-zinc-300">{row.body}</p>
            <p className="text-xs text-zinc-500">
              {row.createdBy?.name || "Unknown"} · {formatDateTime(row.createdAt)}
            </p>
            {canPost ? (
              <Button
                variant="ghost"
                className="h-8 px-2"
                loading={workingId === row.id}
                onClick={() => setActive(row, row.active === false)}
              >
                {row.active === false ? "Restore" : "Hide"}
              </Button>
            ) : null}
          </article>
        ))}
      </div>
      ) : null}
      {list.total > list.limit ? (
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Page {list.page} of {Math.max(1, Math.ceil(list.total / list.limit))}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={list.page <= 1} onClick={() => list.setPage(list.page - 1)}>Previous</Button>
            <Button variant="secondary" disabled={list.page * list.limit >= list.total} onClick={() => list.setPage(list.page + 1)}>Next</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
