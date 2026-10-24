import assert from "node:assert/strict";
import test from "node:test";
import { lineFormula, payslipShareText, whatsAppHref } from "./payslipText.js";

test("prints deduction inputs the way the brief describes them", () => {
  assert.equal(
    lineFormula({ label: "Absent deduction", days: 2, perDay: 6818.18, amount: 13636.36 }),
    "2 absent days x Rs 6,818.18",
  );
  assert.equal(
    lineFormula({ label: "Half day deduction", days: 1, factor: 0.5, perDay: 6818.18, amount: 3409.09 }),
    "1 half day x 0.5 x Rs 6,818.18",
  );
});

test("builds a wa.me link and does not call WhatsApp", () => {
  const text = payslipShareText({ month: "2026-10", net: 1000, gross: 1500, deductions: 200, tax: 300 });
  const href = whatsAppHref(text);
  assert.match(href, /^https:\/\/wa\.me\/\?text=/);
  assert.match(decodeURIComponent(href), /Net pay Rs 1,000\.00/);
});
