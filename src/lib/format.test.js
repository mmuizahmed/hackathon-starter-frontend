import assert from "node:assert/strict";
import test from "node:test";
import {
  currentMonthInKarachi,
  formatClock,
  formatDate,
  formatHours,
  formatMoney,
  formatRupees,
  formatTime,
  hoursBetween,
  todayInKarachi,
} from "./format.js";

test("Karachi calendar day follows the offset, not the browser zone", () => {
  assert.equal(todayInKarachi(new Date("2026-10-24T20:30:00Z")), "2026-10-25");
  assert.equal(currentMonthInKarachi(new Date("2026-10-24T20:30:00Z")), "2026-10");
});

test("formats an ISO check-in in Asia/Karachi", () => {
  assert.equal(formatTime("2026-10-24T04:05:00.000Z"), "09:05");
  assert.equal(formatClock("2026-10-24T04:05:00.000Z", "2026-10-24"), "09:05");
  assert.equal(formatClock("2026-10-24T19:30:00.000Z", "2026-10-24"), "00:30 (25 Oct 2026)");
});

test("formats calendar dates and hours from the timestamps", () => {
  assert.equal(formatDate("2026-11-02"), "2 Nov 2026");
  assert.equal(hoursBetween("2026-10-24T04:00:00.000Z", "2026-10-24T12:30:00.000Z"), 8.5);
  assert.equal(formatHours(8.5), "8.50 h");
  assert.equal(formatHours(null), "—");
  assert.equal(formatMoney(150000), "150,000.00");
});

test("rupee labels use the same digits as formatMoney", () => {
  assert.equal(formatRupees(6818.18), "Rs 6,818.18");
  assert.equal(formatRupees(null), "—");
});
