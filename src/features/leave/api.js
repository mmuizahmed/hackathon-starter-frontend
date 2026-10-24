import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function getLeaveBalances(query = {}, options) {
  return api(withQuery("/leave/balances", query), options);
}

export function listLeaveTypes(query = {}, options) {
  return api(withQuery("/leave-types", query), options);
}

export function listLeaveRequests(query = {}, options) {
  return api(withQuery("/leave/requests", query), options);
}

export function applyForLeave(body, options) {
  return api("/leave/requests", { method: "POST", body, ...options });
}

export function cancelLeaveRequest(id, options) {
  return api(`/leave/requests/${id}/cancel`, { method: "POST", ...options });
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
