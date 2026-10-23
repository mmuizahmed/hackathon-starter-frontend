// Every backend call goes through this file.
// Dev: Vite proxies `/api` to http://localhost:5000.
// Prod: vercel.json rewrites `/api` to the hosted backend.
const BASE_URL = "/api";

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Fetch a path under `/api`.
 * Success shape: { success: true, data, meta? }
 * Error shape:   { success: false, message }
 * Network failures throw an Error with code "unreachable".
 */
export async function api(path, options = {}) {
  const { body, headers, ...rest } = options;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    const unreachable = new Error("Backend unreachable");
    unreachable.code = "unreachable";
    throw unreachable;
  }

  const payload = await readJson(response);

  if (!response.ok || payload?.success === false) {
    const error = new Error(
      payload?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function getHealth(options) {
  return api("/health", options);
}
