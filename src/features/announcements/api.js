import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "admin", label: "Admins" },
  { value: "hr", label: "HR" },
  { value: "employee", label: "Employees" },
];

export function listAnnouncements(query = {}, options) {
  return api(withQuery("/announcements", query), options);
}

export function createAnnouncement(body) {
  return api("/announcements", { method: "POST", body });
}

export function updateAnnouncement(id, body) {
  return api(`/announcements/${id}`, { method: "PATCH", body });
}
