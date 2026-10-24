import assert from "node:assert/strict";
import test from "node:test";
import { balanceText, colleagueText, holidayText, yearLeaveText } from "./contextLabel.js";

test("balance reads as the reviewer says it", () => {
  assert.equal(
    balanceText({
      leaveType: { name: "Casual" },
      context: { balance: { before: 10, after: 8 } },
    }),
    "Casual 10 -> 8",
  );
});

test("unlimited leave does not invent a balance", () => {
  assert.equal(
    balanceText({
      leaveType: { name: "Unpaid" },
      context: { balance: { before: null, after: null } },
    }),
    "Unpaid has no yearly cap",
  );
});

test("context lists holidays, colleagues, and this year's leave", () => {
  assert.equal(
    holidayText([{ date: "2026-11-02", name: "Test holiday", tentative: true }]),
    "2 Nov 2026 Test holiday (tentative)",
  );
  assert.equal(holidayText([]), "None in this range");
  assert.match(colleagueText([{ name: "Ali", code: "SICK", startDate: "2026-10-30", endDate: "2026-11-02" }]), /Ali \(SICK\)/);
  assert.equal(colleagueText([]), "None in this department");
  assert.match(
    yearLeaveText([{ code: "ANNUAL", startDate: "2026-03-02", endDate: "2026-03-03", days: 2 }]),
    /ANNUAL .* 2d/,
  );
  assert.equal(yearLeaveText([]), "No approved leave this year");
});
