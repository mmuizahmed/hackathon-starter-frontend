import assert from "node:assert/strict";
import test from "node:test";
import { canCancelLeave, countWeekdays } from "./rules.js";

test("counts weekdays and skips the weekend", () => {
  assert.equal(countWeekdays("2026-10-26", "2026-10-27"), 2);
  assert.equal(countWeekdays("2026-10-23", "2026-10-26"), 2);
  assert.equal(countWeekdays("2026-10-24", "2026-10-25"), 0);
  assert.equal(countWeekdays("2026-10-27", "2026-10-26"), 0);
});

test("cancel is allowed for pending and for approved leave that has not started", () => {
  assert.equal(canCancelLeave({ status: "pending", startDate: "2026-10-01" }, "2026-10-24"), true);
  assert.equal(canCancelLeave({ status: "approved", startDate: "2026-10-30" }, "2026-10-24"), true);
  assert.equal(canCancelLeave({ status: "approved", startDate: "2026-10-24" }, "2026-10-24"), false);
  assert.equal(canCancelLeave({ status: "rejected", startDate: "2026-11-01" }, "2026-10-24"), false);
});
