import assert from "node:assert/strict";
import test from "node:test";
import { toQuery } from "./query.js";

test("drops empty filters and keeps the rest", () => {
  assert.equal(toQuery({ from: "2026-10-01", to: "", departmentId: null, page: 1 }), "?from=2026-10-01&page=1");
  assert.equal(toQuery({}), "");
});
