import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function getLeaveBalances(params = {}, options) {
  return api(`/leave/balances${toQuery(params)}`, options);
}

export function listLeaveRequests(params = {}, options) {
  return api(`/leave/requests${toQuery(params)}`, options);
}

export function applyForLeave(body, options) {
  return api("/leave/requests", { method: "POST", body, ...options });
}

export function cancelLeaveRequest(id, options) {
  return api(`/leave/requests/${id}/cancel`, { method: "POST", ...options });
}
