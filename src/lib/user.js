const ROLES = new Set(["admin", "hr", "employee"]);

function isTruthyFlag(value) {
  return value === true || value === 1 || value === "true";
}

export function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  if (!ROLES.has(user.role)) return null;

  return {
    id: user.id ?? null,
    name: typeof user.name === "string" ? user.name : "",
    email: typeof user.email === "string" ? user.email : "",
    role: user.role,
    mustChangePassword: isTruthyFlag(user.mustChangePassword),
    employeeId: user.employeeId ?? null,
  };
}

// Login and /auth/me both use { user }, but accept a bare user object too.
export function userFromPayload(data) {
  if (!data || typeof data !== "object") return null;
  if (data.user) return normalizeUser(data.user);
  return normalizeUser(data);
}

export function isInitialized(data) {
  return Boolean(data && data.initialized);
}

export function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "hr") return "HR";
  if (role === "employee") return "Employee";
  return "Unknown";
}

export function displayInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
