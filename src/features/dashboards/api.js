import { api } from "../../lib/api";
import { toQuery } from "../../lib/query";

export function getMyDashboard(options) {
  return api("/analytics/me", options);
}

export function getHrDashboard(params = {}, options) {
  return api(`/analytics/hr${toQuery(params)}`, options);
}

export function getAdminDashboard(params = {}, options) {
  return api(`/analytics/admin${toQuery(params)}`, options);
}

export function getAbsenceAnomalies(params = {}, options) {
  return api(`/analytics/anomalies${toQuery(params)}`, options);
}

export function getAttritionRisk(params = {}, options) {
  return api(`/analytics/attrition-risk${toQuery(params)}`, options);
}
