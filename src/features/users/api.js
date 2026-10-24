import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listHrUsers(query = {}, options) {
  return api(withQuery("/users", { role: "hr", limit: 20, ...query }), options);
}

export function createHrUser(body) {
  return api("/users", { method: "POST", body });
}

export function updateUser(id, body) {
  return api(`/users/${id}`, { method: "PATCH", body });
}
