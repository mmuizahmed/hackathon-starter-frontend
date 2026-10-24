import { useEffect, useState } from "react";
import { Button, Card, DatePicker, FormAlert, Input, Textarea } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { requestCorrection } from "../../../features/attendance/api";

const EMPTY = { date: "", checkIn: "", checkOut: "", reason: "" };

export function CorrectionForm({ today, initialDate = "", onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ ...EMPTY, date: initialDate });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialDate) return;
    setForm((current) => ({ ...current, date: initialDate }));
  }, [initialDate]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.date) nextErrors.date = "Choose the date to correct.";
    if (form.date && today && form.date > today) nextErrors.date = "A correction cannot be in the future.";
    if (!form.checkIn && !form.checkOut) nextErrors.checkIn = "Enter a check-in time, a check-out time, or both.";
    if (!form.reason.trim()) nextErrors.reason = "Say why this record should change.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    const body = { date: form.date, reason: form.reason.trim() };
    if (form.checkIn) body.requestedCheckIn = form.checkIn.slice(0, 5);
    if (form.checkOut) body.requestedCheckOut = form.checkOut.slice(0, 5);

    setSubmitting(true);
    try {
      await requestCorrection(body);
      toast.success("Correction requested.");
      setForm({ ...EMPTY, date: form.date });
      onCreated();
    } catch (error) {
      setFormError(error.message);
      if (error.errors) setErrors((current) => ({ ...current, ...error.errors }));
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Request correction">
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <FormAlert message={formError} />
        <DatePicker
          name="date"
          label="Date"
          max={today}
          value={form.date}
          error={errors.date}
          required
          onChange={(event) => update("date", event.target.value)}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="requestedCheckIn"
            type="time"
            label="Check in"
            value={form.checkIn}
            error={errors.checkIn || errors.requestedCheckIn}
            onChange={(event) => update("checkIn", event.target.value)}
          />
          <Input
            name="requestedCheckOut"
            type="time"
            label="Check out"
            value={form.checkOut}
            error={errors.checkOut || errors.requestedCheckOut}
            onChange={(event) => update("checkOut", event.target.value)}
          />
        </div>
        <Textarea
          name="reason"
          label="Reason"
          value={form.reason}
          error={errors.reason}
          required
          onChange={(event) => update("reason", event.target.value)}
        />
        <Button type="submit" loading={submitting}>
          Submit request
        </Button>
      </form>
    </Card>
  );
}
