import assert from "node:assert/strict";
import test from "node:test";
import { withQuery } from "./query.js";

test("drops empty filters and keeps the rest", () => {
  assert.equal(
    withQuery("/analytics/hr", { from: "2026-10-01", to: "", departmentId: null, page: 1 }),
    "/analytics/hr?from=2026-10-01&page=1",
  );
  assert.equal(withQuery("/analytics/hr", {}), "/analytics/hr");
});
