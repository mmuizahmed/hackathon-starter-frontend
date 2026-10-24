import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { WeekendPicker } from "../../../components/forms/WeekendPicker";
import { Button, Card, ErrorState, FormAlert, Input, PageHeader, Spinner } from "../../../components/ui";
import { useToast } from "../../../context/ToastContext";
import { getSettings, updateSettings } from "../../../features/organization/api";
import { buildSettingsPayload, settingsToForm, validateSettingsForm } from "../../../features/organization/settings";
import { ApiError } from "../../../lib/api";
import { fieldMessage, messageFrom } from "../../../lib/errors";
import { readCurrentPosition } from "../../../lib/geo";

export function CompanySettingsView({ readOnly = false }) {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  function load() {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    getSettings({ signal: controller.signal })
      .then((settings) => setForm(settingsToForm(settings)))
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setLoadError(messageFrom(error, "Could not load company settings."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }

  useEffect(() => load(), []);

  function onChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function onToggleDay(day) {
    if (readOnly) return;
    setForm((current) => {
      const selected = current.weekend.includes(day);
      const weekend = selected ? current.weekend.filter((item) => item !== day) : [...current.weekend, day];
      return { ...current, weekend };
    });
    setErrors((current) => ({ ...current, weekend: undefined }));
  }

  function onUseLocation() {
    setLocationMessage("");
    setLocating(true);
    readCurrentPosition()
      .then((position) => {
        setForm((current) => ({
          ...current,
          officeLat: position.latitude,
          officeLng: position.longitude,
        }));
      })
      .catch((error) => setLocationMessage(error.message))
      .finally(() => setLocating(false));
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (readOnly || saving) return;
    const nextErrors = validateSettingsForm(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const saved = await updateSettings(buildSettingsPayload(form));
      setForm(settingsToForm(saved));
      toast.success("Company settings saved.");
    } catch (error) {
      const fieldErrors = error instanceof ApiError ? error.errors : null;
      if (fieldErrors) {
        setErrors({
          companyName: fieldMessage(fieldErrors, "companyName"),
          officeStart: fieldMessage(fieldErrors, "officeStart"),
          graceMinutes: fieldMessage(fieldErrors, "graceMinutes"),
          halfDayHours: fieldMessage(fieldErrors, "halfDayHours"),
          weekend: fieldMessage(fieldErrors, "weekend"),
          officeLat: fieldMessage(fieldErrors, "officeLat"),
          officeLng: fieldMessage(fieldErrors, "officeLng"),
          radiusMeters: fieldMessage(fieldErrors, "radiusMeters"),
          latesPerHalfDay: fieldMessage(fieldErrors, "latesPerHalfDay"),
        });
      }
      setFormError(messageFrom(error, "Could not save company settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Settings"
        description={
          readOnly
            ? "Office hours and location. Only an admin can change these."
            : "Office hours, weekend, location, and the late-arrival penalty."
        }
      />
      {loading ? <Spinner label="Loading company settings" /> : null}
      {loadError ? <ErrorState title="Could not load settings" message={loadError} onRetry={load} /> : null}
      {form ? (
        <form onSubmit={onSubmit} className="max-w-3xl space-y-4">
          <Card title="Office rules">
            <div className="space-y-4">
              <FormAlert message={formError} />
              <Input
                name="companyName"
                label="Company name"
                value={form.companyName}
                error={errors.companyName}
                disabled={readOnly}
                required
                onChange={(event) => onChange("companyName", event.target.value)}
              />
              <Input
                name="officeStart"
                type="time"
                label="Office start"
                hint="Arrivals after this time plus the grace period are late."
                value={form.officeStart}
                error={errors.officeStart}
                disabled={readOnly}
                required
                onChange={(event) => onChange("officeStart", event.target.value)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name="graceMinutes"
                  type="number"
                  label="Grace (minutes)"
                  min="0"
                  max="180"
                  step="1"
                  value={form.graceMinutes}
                  error={errors.graceMinutes}
                  disabled={readOnly}
                  required
                  onChange={(event) => onChange("graceMinutes", event.target.value)}
                />
                <Input
                  name="halfDayHours"
                  type="number"
                  label="Half day under (hours)"
                  min="1"
                  max="12"
                  step="0.5"
                  value={form.halfDayHours}
                  error={errors.halfDayHours}
                  disabled={readOnly}
                  required
                  onChange={(event) => onChange("halfDayHours", event.target.value)}
                />
              </div>
              <WeekendPicker value={form.weekend} error={errors.weekend} disabled={readOnly} onToggle={onToggleDay} />
            </div>
          </Card>
          <Card title="Office location">
            <div className="space-y-4">
              {readOnly ? null : (
                <Button type="button" variant="secondary" onClick={onUseLocation} loading={locating}>
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Use my current location
                </Button>
              )}
              {locationMessage ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{locationMessage}</p> : null}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name="officeLat"
                  type="number"
                  label="Latitude"
                  step="0.000001"
                  value={form.officeLat}
                  error={errors.officeLat}
                  disabled={readOnly}
                  onChange={(event) => onChange("officeLat", event.target.value)}
                />
                <Input
                  name="officeLng"
                  type="number"
                  label="Longitude"
                  step="0.000001"
                  value={form.officeLng}
                  error={errors.officeLng}
                  disabled={readOnly}
                  onChange={(event) => onChange("officeLng", event.target.value)}
                />
              </div>
              <Input
                name="radiusMeters"
                type="number"
                label="Office radius (meters)"
                hint="Camera check-in must be inside this distance."
                min="1"
                max="100000"
                step="1"
                value={form.radiusMeters}
                error={errors.radiusMeters}
                disabled={readOnly}
                required
                onChange={(event) => onChange("radiusMeters", event.target.value)}
              />
            </div>
          </Card>
          <Card title="Late penalty">
            <div className="space-y-4">
              <label className="flex items-start gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-brand-700"
                  checked={form.latePenaltyEnabled}
                  disabled={readOnly}
                  onChange={(event) => onChange("latePenaltyEnabled", event.target.checked)}
                />
                <span>
                  Count repeated late arrivals toward a half day
                  <span className="mt-1 block text-zinc-500 dark:text-zinc-400">
                    Payroll uses this when it is turned on. It starts off.
                  </span>
                </span>
              </label>
              <Input
                name="latesPerHalfDay"
                type="number"
                label="Lates per half day"
                min="1"
                max="31"
                step="1"
                value={form.latesPerHalfDay}
                error={errors.latesPerHalfDay}
                disabled={readOnly || !form.latePenaltyEnabled}
                onChange={(event) => onChange("latesPerHalfDay", event.target.value)}
              />
            </div>
          </Card>
          {readOnly ? null : (
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save settings
              </Button>
            </div>
          )}
        </form>
      ) : null}
    </div>
  );
}
