import { api } from "../../lib/api";

export function login(body) {
  return api("/auth/login", { method: "POST", body });
}

export function logout() {
  return api("/auth/logout", { method: "POST" });
}

export function getCurrentUser(options) {
  return api("/auth/me", options);
}

export function changePassword(body) {
  return api("/auth/change-password", { method: "POST", body });
}
