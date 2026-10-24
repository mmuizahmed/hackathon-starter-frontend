import { useEffect, useState } from "react";
import { Button, FormAlert, Modal, Textarea } from "../../../components/ui";
import { formatClock, formatDate } from "../../../lib/format";

export function ReviewCorrectionDialog({ correction, decision, busy, error, onClose, onSubmit }) {
  const [comment, setComment] = useState("");
  const [fieldError, setFieldError] = useState("");
  const rejecting = decision === "rejected";

  useEffect(() => {
    setComment("");
    setFieldError("");
  }, [correction, decision]);

  if (!correction) return null;

  function submit() {
    const next = comment.trim();
    if (!next) {
      setFieldError("A comment is required.");
      return;
    }
    onSubmit(next);
  }

  return (
    <Modal
      open
      title={rejecting ? "Reject correction" : "Approve correction"}
      onClose={busy ? () => {} : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant={rejecting ? "danger" : "primary"} onClick={submit} loading={busy}>
            {rejecting ? "Reject" : "Approve"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {formatDate(correction.date)}. Requested check-in {formatClock(correction.requestedCheckIn, correction.date)},
          check-out {formatClock(correction.requestedCheckOut, correction.date)}.
        </p>
        <p className="text-sm leading-6 text-zinc-800 dark:text-zinc-100">{correction.reason}</p>
        <FormAlert message={error} />
        <Textarea
          name="comment"
          label="Comment"
          hint="Stored on the correction. Approval rewrites that day's attendance."
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
