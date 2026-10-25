import { MapPin } from "lucide-react";
import { WeekendPicker } from "../../../components/forms/WeekendPicker";
import { Button, Input } from "../../../components/ui";

export function OfficeStep({ form, errors, locating, locationMessage, onChange, onToggleDay, onUseLocation }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Common defaults are filled in. Change them to match your office.
      </p>
      <Input
        name="officeStart"
        type="time"
        label="Office start"
        hint="Arrivals after this time plus the grace period are late."
        value={form.officeStart}
        error={errors.officeStart}
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
          inputMode="numeric"
          value={form.graceMinutes}
          error={errors.graceMinutes}
          required
          onChange={(event) => onChange("graceMinutes", event.target.value)}
        />
        <Input
          name="halfDayHours"
          type="number"
          label="Half day under (hours)"
          hint="Worked time below this counts as a half day."
          min="0.5"
          max="12"
          step="0.5"
          inputMode="decimal"
          value={form.halfDayHours}
          error={errors.halfDayHours}
          required
          onChange={(event) => onChange("halfDayHours", event.target.value)}
        />
      </div>
      <WeekendPicker value={form.weekend} error={errors.weekend} onToggle={onToggleDay} />
      <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Office location</p>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onUseLocation} loading={locating}>
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Use my current location
          </Button>
        </div>
        {locationMessage ? <p className="text-sm text-zinc-600 dark:text-zinc-400">{locationMessage}</p> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="officeLat"
            type="number"
            label="Latitude"
            step="0.000001"
            inputMode="decimal"
            value={form.officeLat}
            error={errors.officeLat}
            onChange={(event) => onChange("officeLat", event.target.value)}
          />
          <Input
            name="officeLng"
            type="number"
            label="Longitude"
            step="0.000001"
            inputMode="decimal"
            value={form.officeLng}
            error={errors.officeLng}
            onChange={(event) => onChange("officeLng", event.target.value)}
          />
        </div>
        <Input
          name="radiusMeters"
          type="number"
          label="Office radius (meters)"
          hint="Camera check-in must be inside this distance. You can leave the coordinates blank and set them later."
          min="10"
          max="5000"
          step="10"
          inputMode="numeric"
          value={form.radiusMeters}
          error={errors.radiusMeters}
          required
          onChange={(event) => onChange("radiusMeters", event.target.value)}
        />
      </div>
    </div>
  );
}
