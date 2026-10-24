import assert from "node:assert/strict";
import test from "node:test";
import { displayInitials, isInitialized, normalizeUser, roleLabel, userFromPayload } from "./user.js";

test("normalizeUser keeps the contract fields and a real role", () => {
  const user = normalizeUser({
    id: "u1",
    name: "Amina Shah",
    email: "amina@example.com",
    role: "hr",
    mustChangePassword: 1,
    employeeId: "e1",
    extra: "ignored",
  });

  assert.deepEqual(user, {
    id: "u1",
    name: "Amina Shah",
    email: "amina@example.com",
    role: "hr",
    mustChangePassword: true,
    employeeId: "e1",
  });
});

test("normalizeUser rejects a missing or unknown role", () => {
  assert.equal(normalizeUser(null), null);
  assert.equal(normalizeUser({ email: "a@b.co", role: "owner" }), null);
});

test("mustChangePassword is only true for real truthy flags", () => {
  assert.equal(normalizeUser({ role: "admin", mustChangePassword: "false" }).mustChangePassword, false);
  assert.equal(normalizeUser({ role: "admin", mustChangePassword: "true" }).mustChangePassword, true);
  assert.equal(normalizeUser({ role: "admin", mustChangePassword: false }).mustChangePassword, false);
});

test("userFromPayload reads data.user or a bare user", () => {
  const wrapped = userFromPayload({ user: { role: "employee", name: "Ali" } });
  const bare = userFromPayload({ role: "employee", name: "Ali" });
  assert.equal(wrapped.role, "employee");
  assert.equal(bare.name, "Ali");
  assert.equal(userFromPayload(null), null);
});

test("isInitialized reads the setup status flag", () => {
  assert.equal(isInitialized({ initialized: true }), true);
  assert.equal(isInitialized({ initialized: false }), false);
  assert.equal(isInitialized(null), false);
});

test("role labels and initials", () => {
  assert.equal(roleLabel("hr"), "HR");
  assert.equal(roleLabel("nope"), "Unknown");
  assert.equal(displayInitials("Amina Shah"), "AS");
  assert.equal(displayInitials("Ali"), "AL");
  assert.equal(displayInitials(""), "?");
});
