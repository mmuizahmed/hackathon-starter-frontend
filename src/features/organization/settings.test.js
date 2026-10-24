import assert from "node:assert/strict";
import test from "node:test";
import { buildSettingsPayload, settingsToForm, validateSettingsForm } from "./settings.js";

test("settings form uses the API weekend codes and late penalty", () => {
  const form = settingsToForm({
    companyName: "Northwind",
    officeStart: "09:00",
    graceMinutes: 15,
    halfDayHours: 5,
    weekend: ["Sat", "Sun"],
    officeLat: null,
    officeLng: null,
    radiusMeters: 150,
    latePenalty: { enabled: false, latesPerHalfDay: 3 },
  });

  assert.deepEqual(form.weekend, ["Sat", "Sun"]);
  assert.equal(form.officeLat, "");
  assert.equal(form.latePenaltyEnabled, false);

  const payload = buildSettingsPayload(form);
  assert.equal(payload.officeLat, null);
  assert.equal(payload.officeLng, null);
  assert.deepEqual(payload.latePenalty, { enabled: false, latesPerHalfDay: 3 });
  assert.deepEqual(payload.weekend, ["Sat", "Sun"]);
});

test("a single coordinate is rejected before it is sent", () => {
  const form = settingsToForm({ weekend: ["Sat"] });
  form.officeLat = "24.8";
  const errors = validateSettingsForm(form);
  assert.match(errors.officeLat, /both/);
});
