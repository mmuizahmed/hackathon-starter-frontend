import assert from "node:assert/strict";
import test from "node:test";
import { assistantProblem, smartLeaveDraft } from "./messages.js";

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
