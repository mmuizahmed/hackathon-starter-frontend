const BASE_URL = "/api";

// A 401 here means "you are signed out" or "wrong password", not "kick them to login".
// Redirecting /auth/me would loop on the first load of a signed-out browser.
const NO_REDIRECT_ON_401 = new Set([
  "/setup/status",
  "/setup",
  "/auth/login",
  "/auth/logout",
  "/auth/me",
]);

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, code = null, payload = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
    this.payload = payload;
  }
}

export function normalizeFieldErrors(errors) {
  if (!errors) return null;

  if (Array.isArray(errors)) {
    const out = {};
    for (const item of errors) {
      if (!item) continue;
      const field = item.field || item.path || item.param;
      const message = item.message || item.msg;
      if (field && message) out[field] = String(message);
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  if (typeof errors === "object") {
    const out = {};
    for (const [field, value] of Object.entries(errors)) {
      if (Array.isArray(value)) {
        if (value[0] != null) out[field] = String(value[0]);
      } else if (value && typeof value === "object") {
        const message = value.message || value.msg;
        if (message) out[field] = String(message);
      } else if (value != null && value !== "") {
        out[field] = String(value);
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  return null;
}

function endpointPath(path) {
  const value = String(path || "").split("?")[0];
  return value.startsWith("/") ? value : `/${value}`;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function notifyUnauthorized() {
  if (typeof window === "undefined") return;
  // api.js stays free of React. AuthProvider listens and sends the user to /login.
  window.dispatchEvent(new CustomEvent("hcm:unauthorized"));
}

/**
 * Call a path under `/api`.
 * Returns the envelope's `data` (lists are `{ items, total, page, limit }`).
 * Throws ApiError with status, message, and field errors.
 * Sends the session cookie (`credentials: "include"`).
 */
export async function api(path, options = {}) {
  const { body, headers, redirectOn401, ...rest } = options;
  const requestPath = String(path || "");
  const pathOnly = endpointPath(requestPath);
  const urlPath = requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
  const allowRedirect = redirectOn401 !== false && !NO_REDIRECT_ON_401.has(pathOnly);

  let response;
  try {
    response = await fetch(`${BASE_URL}${urlPath}`, {
      ...rest,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the server. Check that the API is running.", {
      code: "unreachable",
    });
  }

  const payload = await readJson(response);
  const failed = !response.ok || payload?.success === false;

  if (failed) {
    const message = payload?.message || `Request failed (${response.status})`;
    if (response.status === 401 && allowRedirect) notifyUnauthorized();
    throw new ApiError(message, {
      status: response.status,
      errors: normalizeFieldErrors(payload?.errors),
      payload,
    });
  }

  return payload?.data ?? null;
}
