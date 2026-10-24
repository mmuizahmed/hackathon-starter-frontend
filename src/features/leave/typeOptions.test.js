import assert from "node:assert/strict";
import test from "node:test";
import { leaveTypeChoices } from "./typeOptions.js";

test("matches a balance code to an id from the catalog or an older request", () => {
  const choices = leaveTypeChoices({
    balances: [
      { code: "CASUAL", name: "Casual", quota: 10, used: 0, pending: 1, remaining: 10 },
      { code: "SICK", name: "Sick", quota: 8, used: 0, pending: 0, remaining: 8 },
    ],
    catalog: [{ id: "a".repeat(24), code: "CASUAL", name: "Casual" }],
    requests: [{ leaveType: { id: "b".repeat(24), code: "SICK", name: "Sick" } }],
  });

  assert.equal(choices[0].id, "a".repeat(24));
  assert.equal(choices[1].id, "b".repeat(24));
  assert.equal(choices[0].pending, 1);
});

test("leaves the id blank when the server never sent one", () => {
  const choices = leaveTypeChoices({
    balances: [{ code: "ANNUAL", name: "Annual", remaining: 14 }],
  });
  assert.equal(choices[0].id, "");
});
