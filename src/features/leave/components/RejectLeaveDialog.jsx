import { useEffect, useState } from "react";
import { Button, FormAlert, Modal, Textarea } from "../../../components/ui";
import { formatDateRange } from "../../../lib/format";

export function RejectLeaveDialog({ request, busy, error, onClose, onSubmit }) {
  const [comment, setComment] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    setComment("");
    setFieldError("");
  }, [request]);

  if (!request) return null;

  function submit() {
    const next = comment.trim();
    if (!next) {
      setFieldError("A comment is required to reject leave.");
      return;
    }
    onSubmit(next);
  }

  return (
    <Modal
      open
      title="Reject leave"
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} loading={busy}>
            Reject
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {request.employeeName || "Employee"} · {request.leaveType?.name || "Leave"} ·{" "}
          {formatDateRange(request.startDate, request.endDate)}. The employee is notified.
        </p>
        <FormAlert message={error} />
        <Textarea
          name="comment"
          label="Comment"
          value={comment}
          error={fieldError}
          onChange={(event) => {
            setComment(event.target.value);
            setFieldError("");
          }}
        />
      </div>
    </Modal>
  );
}
