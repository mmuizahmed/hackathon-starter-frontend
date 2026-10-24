import assert from "node:assert/strict";
import test from "node:test";
import { formatRupees, formatTime, karachiToday, shiftMonth } from "./format.js";

test("formats rupees the way a payslip line is read", () => {
  assert.equal(formatRupees(6818.18), "Rs 6,818.18");
  assert.equal(formatRupees(null), "—");
});

test("shows a server timestamp in Asia/Karachi", () => {
  // 04:05 UTC is 09:05 in Karachi.
  assert.match(formatTime("2026-10-24T04:05:00.000Z").toLowerCase(), /9:05/);
});

test("karachiToday uses the Karachi calendar, not UTC", () => {
  assert.equal(karachiToday(new Date("2026-10-24T18:00:00.000Z")), "2026-10-24");
  assert.equal(karachiToday(new Date("2026-10-24T20:30:00.000Z")), "2026-10-25");
});

test("shiftMonth crosses the year boundary", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
});
