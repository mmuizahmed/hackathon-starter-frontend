import assert from "node:assert/strict";
import test from "node:test";
import { attendanceActionError } from "./messages.js";

test("a second check-in is shown as already checked in", () => {
  const error = { status: 409, message: "Already checked in today" };
  assert.equal(attendanceActionError(error, "in"), "Already checked in today");
  assert.equal(attendanceActionError({ status: 409, message: "" }, "in"), "Already checked in today");
});

test("other attendance errors keep the server message", () => {
  assert.equal(
    attendanceActionError({ status: 400, message: "Check in before checking out" }, "out"),
    "Check in before checking out",
  );
});
