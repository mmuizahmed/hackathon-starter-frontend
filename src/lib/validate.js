export const MIN_PASSWORD_LENGTH = 8;

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}
