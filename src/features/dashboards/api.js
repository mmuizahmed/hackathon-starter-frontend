import { api } from "../../lib/api";
import { withQuery } from "../../lib/query";

export function getMyDashboard(options) {
  return api("/analytics/me", options);
}

export function getHrDashboard(query = {}, options) {
  return api(withQuery("/analytics/hr", query), options);
}

export function getAdminDashboard(query = {}, options) {
  return api(withQuery("/analytics/admin", query), options);
}

export function getAbsenceAnomalies(query = {}, options) {
  return api(withQuery("/analytics/anomalies", query), options);
}

export function getAttritionRisk(query = {}, options) {
  return api(withQuery("/analytics/attrition-risk", query), options);
}
