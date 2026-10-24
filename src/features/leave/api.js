import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function listLeaveRequests(query = {}, options) {
  return api(withQuery("/leave/requests", query), options);
}

export function reviewLeave(id, body, options) {
  return api(`/leave/requests/${id}/review`, {
    method: "POST",
    body,
    ...options,
  });
}

export function listDepartments(options) {
  return api(withQuery("/departments", { active: true, limit: 100 }), options);
}
