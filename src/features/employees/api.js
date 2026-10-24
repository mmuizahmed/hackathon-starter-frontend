import { api } from "../../lib/api";

export function getEmployee(id, options) {
  return api(`/employees/${id}`, options);
}

export function updateEmployee(id, body, options) {
  return api(`/employees/${id}`, { method: "PATCH", body, ...options });
}
