import assert from "node:assert/strict";
import test from "node:test";
import { deriveSalary, paidDayCount } from "./salaryMath.js";

test("standard structure is 40% HRA, 10% medical, and 1.5× gross", () => {
  assert.deepEqual(deriveSalary(100000), {
    basic: 100000,
    hra: 40000,
    medical: 10000,
    other: 0,
    gross: 150000,
  });
});

test("blank or zero basic has no preview", () => {
  assert.equal(deriveSalary(""), null);
  assert.equal(deriveSalary(0), null);
  assert.equal(deriveSalary(-5), null);
});

test("paid days keep paid leave and subtract half days", () => {
  assert.equal(
    paidDayCount({
      employedWorkingDays: 22,
      absentDays: 1,
      unpaidLeaveDays: 0,
      halfDays: 2,
      latePenaltyHalfDays: 0,
      paidLeaveDays: 1,
    }),
    20,
  );
});
