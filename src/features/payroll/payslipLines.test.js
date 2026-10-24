import assert from "node:assert/strict";
import test from "node:test";
import { describeLine } from "./payslipLines.js";

test("a deduction line shows the days and the per-day rate", () => {
  assert.equal(
    describeLine({ label: "Absent deduction", days: 1, perDay: 6818.18, amount: 6818.18 }),
    "1 day · per day 6,818.18",
  );
});

test("the tax line keeps the slab text", () => {
  const text = describeLine({
    label: "Income tax",
    amount: 10000,
    slabLabel: "30000 + 15% above 1200000",
    formula: "30000 + 0.15 * (1800000 - 1200000) = 120000; monthly = 120000 / 12",
  });
  assert.match(text, /30000 \+ 15% above 1200000/);
  assert.match(text, /monthly = 120000 \/ 12/);
});
