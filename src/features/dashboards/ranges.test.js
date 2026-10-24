import assert from "node:assert/strict";
import test from "node:test";
import { defaultAdminRange, defaultHrRange, filtersToQuery, isYearToDate } from "./ranges.js";

test("admin starts at 1 January and HR starts at the first of the month", () => {
  assert.deepEqual(defaultAdminRange("2026-10-24"), {
    from: "2026-01-01",
    to: "2026-10-24",
    department: "",
  });
  assert.deepEqual(defaultHrRange("2026-10-24"), {
    from: "2026-10-01",
    to: "2026-10-24",
    department: "",
  });
});

test("blank department is omitted from the query", () => {
  assert.deepEqual(filtersToQuery({ from: "2026-10-01", to: "2026-10-24", department: "" }), {
    from: "2026-10-01",
    to: "2026-10-24",
    departmentId: undefined,
  });
  assert.equal(isYearToDate({ from: "2026-01-01", to: "2026-10-24" }), true);
  assert.equal(isYearToDate({ from: "2026-10-01", to: "2026-10-24" }), false);
});
