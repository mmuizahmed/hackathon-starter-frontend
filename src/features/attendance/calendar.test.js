import assert from "node:assert/strict";
import test from "node:test";
import { calendarCells, countByStatus, monthStartWeekday, shiftMonth } from "./calendar.js";

test("October 2026 starts on Thursday and has 31 days", () => {
  assert.equal(monthStartWeekday("2026-10"), 4);
  const cells = calendarCells("2026-10");
  assert.equal(cells[4], "2026-10-01");
  assert.equal(cells.filter(Boolean).length, 31);
  assert.equal(cells.length % 7, 0);
  assert.equal(cells.at(-1), "2026-10-31");
});

test("shiftMonth crosses the year", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
});

test("board counts only the known statuses", () => {
  const counts = countByStatus([
    { status: "present" },
    { status: "present" },
    { status: "late" },
    { status: "half_day" },
    { status: null },
    { status: "on_leave" },
    { status: "missing_checkout" },
    { status: "absent" },
  ]);
  assert.deepEqual(counts, {
    present: 2,
    late: 1,
    half_day: 1,
    absent: 1,
    on_leave: 1,
    missing_checkout: 1,
  });
});
