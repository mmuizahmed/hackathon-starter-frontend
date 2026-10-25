import assert from "node:assert/strict";
import test from "node:test";
import { assistantProblem, basedOnText, smartLeaveDraft, toolLabel } from "./messages.js";

test("429 and provider fallback stay friendly", () => {
  assert.equal(assistantProblem({ status: 429, message: "nope" }), "Too many AI requests. Try again in an hour.");
  assert.equal(
    assistantProblem(null, { fallback: true, answer: "The assistant took too long. Please try again." }),
    "The assistant took too long. Please try again.",
  );
  assert.equal(
    assistantProblem(null, { fallback: true, message: "The assistant could not fill the leave form." }),
    "The assistant could not fill the leave form.",
  );
});

test("source labels name the record, and stay empty when no tool ran", () => {
  assert.equal(toolLabel("get_my_leave_balance"), "Your leave balance");
  assert.equal(toolLabel("get_custom_report"), "Custom report");
  assert.equal(
    basedOnText([{ tool: "get_my_leave_balance", args: {} }, { tool: "get_headcount" }]),
    "Based on: Your leave balance, Headcount",
  );
  assert.equal(basedOnText([]), "");
  assert.equal(basedOnText([{ args: {} }]), "");
});

test("smart leave only pre-fills a complete, non-fallback draft", () => {
  assert.equal(smartLeaveDraft({ fallback: true, type: "CASUAL", start: "2026-10-26", end: "2026-10-27" }), null);
  assert.deepEqual(
    smartLeaveDraft({
      fallback: false,
      leaveTypeCode: "CASUAL",
      startDate: "2026-10-26",
      endDate: "2026-10-27",
      reason: "Wedding",
    }),
    { code: "CASUAL", startDate: "2026-10-26", endDate: "2026-10-27", reason: "Wedding" },
  );
});
