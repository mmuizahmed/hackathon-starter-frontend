import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError, api, apiBlob, normalizeFieldErrors } from "./api.js";

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("normalizeFieldErrors accepts object, array, and list shapes", () => {
  assert.deepEqual(normalizeFieldErrors({ email: "Invalid email" }), {
    email: "Invalid email",
  });
  assert.deepEqual(normalizeFieldErrors({ email: ["Invalid email"] }), {
    email: "Invalid email",
  });
  assert.deepEqual(normalizeFieldErrors({ email: { message: "Invalid email" } }), {
    email: "Invalid email",
  });
  assert.deepEqual(
    normalizeFieldErrors([{ field: "email", message: "Invalid email" }]),
    { email: "Invalid email" },
  );
  assert.equal(normalizeFieldErrors(null), null);
});

test("unwraps data and sends the session cookie", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/setup/status");
    assert.equal(options.credentials, "include");
    assert.equal(options.headers["Content-Type"], undefined);
    assert.equal(options.headers.Accept, "application/json");
    return jsonResponse({ success: true, data: { initialized: false } });
  };

  const data = await api("/setup/status");
  assert.deepEqual(data, { initialized: false });
});

test("posts JSON and returns data", async () => {
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(options.body), { email: "a@b.co", password: "secret" });
    return jsonResponse({ success: true, data: { user: { id: "1" } } });
  };

  const data = await api("/auth/login", {
    method: "POST",
    body: { email: "a@b.co", password: "secret" },
  });
  assert.deepEqual(data, { user: { id: "1" } });
});

test("throws ApiError with status, message, and field errors", async () => {
  globalThis.fetch = async () =>
    jsonResponse(
      { success: false, message: "Check the form", errors: { email: "Invalid email" } },
      422,
    );

  await assert.rejects(api("/auth/login", { method: "POST", body: {} }), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 422);
    assert.equal(error.message, "Check the form");
    assert.equal(error.errors.email, "Invalid email");
    return true;
  });
});

test("401 on a protected call notifies the app", async () => {
  let eventName = "";
  globalThis.window = {
    location: { pathname: "/admin" },
    dispatchEvent(event) {
      eventName = event.type;
      return true;
    },
  };
  globalThis.fetch = async () => jsonResponse({ success: false, message: "Sign in again" }, 401);

  await assert.rejects(api("/employees"), (error) => {
    assert.equal(error.status, 401);
    return true;
  });
  assert.equal(eventName, "hcm:unauthorized");
});

test("401 on login does not redirect", async () => {
  let called = false;
  globalThis.window = {
    location: { pathname: "/login" },
    dispatchEvent() {
      called = true;
      return true;
    },
  };
  globalThis.fetch = async () =>
    jsonResponse({ success: false, message: "Invalid email or password" }, 401);

  await assert.rejects(api("/auth/login", { method: "POST", body: {} }), (error) => {
    assert.equal(error.message, "Invalid email or password");
    return true;
  });
  assert.equal(called, false);
});

test("network failure is an unreachable ApiError", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  await assert.rejects(api("/setup/status"), (error) => {
    assert.equal(error.code, "unreachable");
    assert.match(error.message, /Cannot reach the server/);
    return true;
  });
});

test("apiBlob returns the PDF and keeps the session cookie", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/payslips/1/pdf");
    assert.equal(options.credentials, "include");
    assert.equal(options.headers.Accept, "application/pdf");
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="payslip-E-001-2026-10.pdf"',
      },
    });
  };

  const file = await apiBlob("/payslips/1/pdf");
  assert.equal(file.filename, "payslip-E-001-2026-10.pdf");
  const bytes = new Uint8Array(await file.blob.arrayBuffer());
  assert.deepEqual([...bytes], [1, 2, 3]);
});

test("apiBlob surfaces a JSON error", async () => {
  globalThis.fetch = async () =>
    jsonResponse({ success: false, message: "Payslip not found" }, 404);

  await assert.rejects(apiBlob("/payslips/missing/pdf"), (error) => {
    assert.equal(error.status, 404);
    assert.equal(error.message, "Payslip not found");
    return true;
  });
});

test("aborted requests are rethrown", async () => {
  globalThis.fetch = async () => {
    const error = new Error("aborted");
    error.name = "AbortError";
    throw error;
  };

  await assert.rejects(api("/setup/status"), (error) => {
    assert.equal(error.name, "AbortError");
    return true;
  });
});
