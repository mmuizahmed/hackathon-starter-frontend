import assert from "node:assert/strict";
import test from "node:test";
import { leaveTypeChoices } from "./typeOptions.js";

test("uses leaveTypeId on the balance", () => {
  const choices = leaveTypeChoices({
    balances: [{ leaveTypeId: "a".repeat(24), code: "CASUAL", name: "Casual", quota: 10, pending: 1, remaining: 10 }],
  });

  assert.equal(choices[0].id, "a".repeat(24));
  assert.equal(choices[0].pending, 1);
});

test("falls back to the leave type catalog when the balance has no id", () => {
  const choices = leaveTypeChoices({
    balances: [{ code: "SICK", name: "Sick", remaining: 8 }],
    catalog: [{ id: "b".repeat(24), code: "SICK", name: "Sick" }],
  });

  assert.equal(choices[0].id, "b".repeat(24));
});
