import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_OFFICE_SETTINGS, buildSetupPayload } from "./payload.js";

test("default office rules match the brief", () => {
  assert.equal(DEFAULT_OFFICE_SETTINGS.officeStart, "09:00");
  assert.equal(DEFAULT_OFFICE_SETTINGS.graceMinutes, "15");
  assert.equal(DEFAULT_OFFICE_SETTINGS.halfDayHours, "5");
  assert.deepEqual(DEFAULT_OFFICE_SETTINGS.weekend, ["Sat", "Sun"]);
  assert.equal(DEFAULT_OFFICE_SETTINGS.radiusMeters, "150");
});

test("buildSetupPayload sends numbers and omits a blank location", () => {
  const payload = buildSetupPayload({
    companyName: "  Northwind  ",
    adminName: " Amina Shah ",
    adminEmail: " admin@northwind.test ",
    adminPassword: "correct-horse",
    ...DEFAULT_OFFICE_SETTINGS,
  });

  assert.equal(payload.companyName, "Northwind");
  assert.equal(payload.adminName, "Amina Shah");
  assert.equal(payload.adminEmail, "admin@northwind.test");
  assert.equal(payload.settings.graceMinutes, 15);
  assert.equal(payload.settings.halfDayHours, 5);
  assert.equal(payload.settings.radiusMeters, 150);
  assert.equal(Object.hasOwn(payload.settings, "officeLat"), false);
  assert.equal(Object.hasOwn(payload.settings, "officeLng"), false);
});

test("buildSetupPayload includes coordinates when both are set", () => {
  const payload = buildSetupPayload({
    companyName: "Northwind",
    adminName: "Amina",
    adminEmail: "admin@northwind.test",
    adminPassword: "correct-horse",
    ...DEFAULT_OFFICE_SETTINGS,
    officeLat: "24.860700",
    officeLng: "67.001100",
  });

  assert.equal(payload.settings.officeLat, 24.8607);
  assert.equal(payload.settings.officeLng, 67.0011);
});
